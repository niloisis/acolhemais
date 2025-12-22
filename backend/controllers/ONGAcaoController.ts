import { Request, Response } from "express";
import basicError from "../utils/BasicError";
import ONGAcaoCreateRequest from "../repositories/dto/ONGAcaoCreateDto";
import ONGAcaoRepository from "../repositories/ONGAcaoRepository";
import ONGMapper from "./mappers/ONGMapper";
import { BUCKET_NAME, minioClient } from "../minio";

export default class ONGAcaoController {

    static async create(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params; // ID da ONG
            const body = req.body;

            // 1. Lógica de Geocodificação (Endereço -> Lat/Lon)
            let localizacao = [0, 0]; // Padrão caso falhe

            // Só busca se tiver endereço preenchido
            if (body.logradouro && body.bairro) {
                try {
                    // Monta a string de busca: "Rua X, Número Y, Bairro Z, Recife, PE"
                    const queryAddress = `${body.logradouro}, ${body.numero || ''}, ${body.bairro}, Recife, Pernambuco, Brazil`;
                    
                    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddress)}&format=json&limit=1`;

                    const geoRes = await fetch(url, {
                        headers: { "User-Agent": "AcolheMais/1.0" } // Nominatim exige User-Agent
                    });
                    
                    const geoData = await geoRes.json();

                    if (geoData && geoData.length > 0) {
                        const lat = parseFloat(geoData[0].lat);
                        const lon = parseFloat(geoData[0].lon);
                        localizacao = [lat, lon];
                        console.log(`📍 Localização encontrada para ação: ${lat}, ${lon}`);
                    }
                } catch (err) {
                    console.error("Erro ao buscar coordenadas da ação:", err);
                    // Não para o fluxo, apenas salva sem coordenadas (ou 0,0)
                }
            }

            // 2. Monta o objeto final para o repositório
            const createAcao: ONGAcaoCreateRequest = {
                ...body,
                ongId: id,
                localizacao: localizacao // Injeta as coordenadas descobertas
            };

            // 3. Salva
            const savedAcao = await ONGAcaoRepository.save(createAcao);

            return res.status(201).json(
                ONGMapper.toCompleteAcaoResponse(savedAcao)
            );

        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro ao tentar salvar ação, tente novamente mais tarde"));
        }
    }

    static async findAllByOng(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            return res.status(200).json(
                ONGMapper.toCompleteAcaoResponseList(
                    await ONGAcaoRepository.findAllByOng(id),
                )
            );
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao buscar ações"));
        }
    }

    static async findAll(req: Request, res: Response): Promise<any> {
        try {
            return res.status(200).json(
                ONGMapper.toCompleteAcaoResponseList(
                    await ONGAcaoRepository.findAll(),
                )
            );
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao buscar ações"));
        }
    }

    static async findById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const acao = await ONGAcaoRepository.findById(id);
            if (!acao) return res.status(404).json(basicError("Ação não encontrada"));
            
            return res.status(200).json(
                ONGMapper.toCompleteAcaoResponse(acao)
            );
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao buscar ação"));
        }
    }

    static async changeBanner(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        try {
            const acao = await ONGAcaoRepository.findById(id);
            if (!acao) return res.status(404).json(basicError("Ação não encontrada."));
            if (!req.file) return res.status(400).json(basicError("Nenhum arquivo enviado."));

            minioClient.putObject(BUCKET_NAME, `${id}-banner`, req.file.buffer, (err, _) => {
                if (err) return res.status(500).json({ message: 'Erro MinIO', error: err });
            });
            return res.status(201).end();
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao salvar banner"));
        }
    }

    static async getBanner(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        try {
            const acao = await ONGAcaoRepository.findById(id);
            if (!acao) return res.status(404).json(basicError("Ação não encontrada."));

            res.setHeader('Content-Type', 'image/png');
            minioClient.getObject(BUCKET_NAME, `${id}-banner`, (err, dataStream) => {
                if (err) return res.status(404).json({ message: 'Banner não encontrado', error: err });
                dataStream.pipe(res);
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao buscar banner"));
        }
    }

    static async update(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const updateAcao = req.body;
        try {
            await ONGAcaoRepository.update(id, updateAcao);
            res.status(200).end();
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao atualizar ação"));
        }
    }

    static async delete(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        try {
            await ONGAcaoRepository.delete(id);
            res.status(204).end();
        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao deletar ação"));
        }
    }
}

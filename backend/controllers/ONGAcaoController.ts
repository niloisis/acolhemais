import {Request, Response} from "express"
import basicError from "../utils/BasicError"
import ONGAcaoCreateRequest from "../repositories/dto/ONGAcaoCreateDto";
import ONGAcaoRepository from "../repositories/ONGAcaoRepository";
import ONGMapper from "./mappers/ONGMapper";
import {BUCKET_NAME, minioClient} from "../minio";

export default class ONGAcaoController {

    static async create(req: Request, res: Response): Promise<any> {
        try {
            const createAcao: ONGAcaoCreateRequest = req.body
            const {id} = req.params
            createAcao.ondId = id
            return res.status(201).json(
                ONGMapper.toCompleteAcaoResponse(
                    await ONGAcaoRepository.save(createAcao),
                )
            )
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao tentar salvar ação, tente novamente mais tarde"));
        }
    }

    static async findAllByOng(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params
            return res.status(200).json(
                ONGMapper.toCompleteAcaoResponseList(
                    await ONGAcaoRepository.findAllByOng(id),
                )
            )
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao tentar salvar ação, tente novamente mais tarde"));
        }
    }

    static async findAll(req: Request, res: Response): Promise<any> {
        try {
            return res.status(200).json(
                ONGMapper.toCompleteAcaoResponseList(
                    await ONGAcaoRepository.findAll(),
                )
            )
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao tentar salvar ação, tente novamente mais tarde"));
        }
    }

    static async findById(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params
            return res.status(200).json(
                ONGMapper.toCompleteAcaoResponse(
                    await ONGAcaoRepository.findById(id),
                )
            )
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao tentar salvar ação, tente novamente mais tarde"));
        }

    }

    static async changeBanner(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const acao = await ONGAcaoRepository.findById(id);
            if (!acao) {
                return res.status(404).json(basicError("Ação não encontrada."));
            }
            minioClient.putObject(BUCKET_NAME, `${id}-banner`, req.file.buffer, (err, _) => {
                if (err) {
                    return res.status(500).json({message: 'Erro ao enviar o arquivo para o MinIO', error: err});
                }
            });
            return res.status(201).end();
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao buscar ONG"));
        }
    }

    static async getBanner(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const acao = await ONGAcaoRepository.findById(id);
            if (!acao) {
                return res.status(404).json(basicError("Ação não encontrada."));
            }
            res.setHeader('Content-Type', 'image/png');
            minioClient.getObject(BUCKET_NAME, `${id}-banner`, (err, dataStream) => {
                if (err) {
                    return res.status(404).json({message: 'Arquivo não encontrado', error: err});
                }
                dataStream.pipe(res);
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao buscar ONG"));
        }
    }

    static async update(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        const updateAcao = req.body
        try {
            await ONGAcaoRepository.update(id, updateAcao);
            res.status(200).end();
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao buscar ONG"));
        }
    }

    static async delete(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            await ONGAcaoRepository.delete(id);
            res.status(204).end();
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao buscar ONG"));
        }
    }
}

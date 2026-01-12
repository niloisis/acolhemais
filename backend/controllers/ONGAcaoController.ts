import { Request, Response } from "express";
import basicError from "../utils/BasicError";
import ONGAcaoCreateRequest from "../repositories/dto/ONGAcaoCreateDto";
import ONGAcaoRepository from "../repositories/ONGAcaoRepository";
import ONGMapper from "./mappers/ONGMapper";
import { BUCKET_NAME, minioClient } from "../minio";

// Imports para o Algoritmo de Distância
import LookupRepository from "../repositories/LookupRepository";
import { getDistanceFromLatLonInKm } from "../utils/GeometryUtils";

export default class ONGAcaoController {

    static async create(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params; // ID da ONG
            const body = req.body;

            // 1. Lógica de Geocodificação (Endereço -> Lat/Lon)
            let localizacao = [0, 0]; 

            // Só busca se tiver endereço preenchido
            if (body.logradouro && body.bairro) {
                try {
                    const queryAddress = `${body.logradouro}, ${body.numero || ''}, ${body.bairro}, Recife, Pernambuco, Brazil`;
                    // console.log(`🔍 Buscando coordenadas para: ${queryAddress}`);

                    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryAddress)}&format=json&limit=1`;

                    const geoRes = await fetch(url, {
                        headers: { "User-Agent": "AcolheMais/1.0" }
                    });
                    
                    const geoData = await geoRes.json();

                    if (geoData && geoData.length > 0) {
                        const lat = parseFloat(geoData[0].lat);
                        const lon = parseFloat(geoData[0].lon);
                        localizacao = [lat, lon];
                        // console.log(`✅ Localização encontrada: ${lat}, ${lon}`);
                    }
                } catch (err) {
                    console.error("❌ Erro ao buscar coordenadas:", err);
                }
            }

            // 2. Monta objeto
            const createAcao: ONGAcaoCreateRequest = {
                ...body,
                ongId: id,
                localizacao: localizacao
            };

            // 3. Salva
            const savedAcao = await ONGAcaoRepository.save(createAcao);

            return res.status(201).json(
                ONGMapper.toCompleteAcaoResponse(savedAcao)
            );

        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro ao tentar salvar ação"));
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

    // --- ALGORITMO HÍBRIDO (IGUAL AO DAS ONGS) ---
    static async findAll(req: Request, res: Response): Promise<any> {
        try {
            const { category, target, search, location, userLat, userLon } = req.query;

            const toArray = (p: any) => (!p ? [] : Array.isArray(p) ? p.map(String) : String(p).split(',').filter(x => x.trim() !== ''));
            const categories = toArray(category);
            const targets = toArray(target);
            const locations = toArray(location);
            const searchTerm = search ? String(search) : undefined;

            // 1. Busca no Banco
            const acoes = await ONGAcaoRepository.findAll({
                category: categories.length > 0 ? categories : undefined,
                target: targets.length > 0 ? targets : undefined,
                search: searchTerm
            });

            // 2. Configuração
            const WEIGHT_CONTENT = 0.4;
            const WEIGHT_DISTANCE = 0.6;
            const MAX_RADIUS_KM = 15;

            // 3. PREPARAÇÃO DOS PONTOS DE REFERÊNCIA (LISTA)
            let referencePoints: any[] = [];

            if (userLat && userLon) {
                referencePoints.push({
                    lat: Number(userLat),
                    lon: Number(userLon),
                    name: "Sua localização"
                });
            } else if (locations.length > 0) {
                const bairrosAncoras = await LookupRepository.findBairrosByNames(locations);
                referencePoints = bairrosAncoras.map((b: any) => ({
                    lat: b.lat,
                    lon: b.lon,
                    name: b.nome
                }));
            }

            const userInterestsSet = new Set([...categories, ...targets]);

            // 4. CÁLCULOS
            let processedAcoes = acoes.map((acao: any) => {
                let overlapScore = 0;
                let normalizedDistScore = 0;
                let debugJaccard = 0;

                // --- DISTÂNCIA (MÚLTIPLOS PONTOS) ---
                let minDist = Infinity;
                let closestRefName = null;

                // Fallback de localização
                let lat = Number(acao.lat);
                let lon = Number(acao.lon);

                if (!lat || !lon || (lat === 0 && lon === 0)) {
                    lat = Number(acao.ong?.lat);
                    lon = Number(acao.ong?.lon);
                }

                if (referencePoints.length > 0 && lat && lon) {
                    referencePoints.forEach(ref => {
                        const d = getDistanceFromLatLonInKm(ref.lat, ref.lon, lat, lon);
                        if (d < minDist) {
                            minDist = d;
                            closestRefName = ref.name;
                        }
                    });

                    if (minDist < MAX_RADIUS_KM) {
                        normalizedDistScore = 1 - (minDist / MAX_RADIUS_KM);
                    } else {
                        normalizedDistScore = 0;
                    }
                }

                // B. Conteúdo (Overlap)
                if (userInterestsSet.size > 0 && acao.ong) {
                    const ongTags = new Set([
                        ...(acao.ong.ongNecessidade?.map((n: any) => n.necessidade.tipo) || []),
                        ...(acao.ong.ongPublicoAlvo?.map((p: any) => p.publicoAlvo.tipo) || [])
                    ]);
                    
                    const intersection = [...userInterestsSet].filter(x => ongTags.has(x)).length;
                    const union = new Set([...userInterestsSet, ...ongTags]).size;

                    overlapScore = intersection / userInterestsSet.size;
                    if (union > 0) debugJaccard = intersection / union;
                } else {
                    overlapScore = 1;
                }

                // C. Score Final
                let finalScore = 0;
                if (overlapScore > 0) {
                    finalScore = (overlapScore * WEIGHT_CONTENT) + (normalizedDistScore * WEIGHT_DISTANCE);
                }

                return { 
                    ...acao, 
                    distanceKm: minDist, 
                    closestRefName: closestRefName,
                    relevanceScore: overlapScore, 
                    distScore: normalizedDistScore,
                    finalScore: finalScore,
                    debugJaccard: debugJaccard
                };
            });

            // 5. Ordenação
            processedAcoes.sort((a: any, b: any) => b.finalScore - a.finalScore);

            // 6. Fallback Textual
            if (locations.length > 0 && referencePoints.length === 0) {
                processedAcoes = processedAcoes.filter((acao: any) => 
                     locations.some(loc => 
                        (acao.endereco && acao.endereco.includes(loc)) || 
                        (acao.bairro?.nome && acao.bairro.nome.includes(loc))
                      )
                );
            }

            return res.status(200).json(
                processedAcoes.map((acao: any) => ({
                    ...ONGMapper.toCompleteAcaoResponse(acao),
                    
                    scoreFinal: (acao.finalScore * 100).toFixed(0),
                    scoreOverlap: (acao.relevanceScore * 100).toFixed(0) + '%',
                    scoreJaccard: (acao.debugJaccard * 100).toFixed(0) + '%',
                    distancia: acao.distanceKm !== Infinity ? acao.distanceKm.toFixed(1) + 'km' : '--',
                    pontoReferencia: acao.closestRefName
                }))
            );

        } catch (error) {
            console.log(error);
            return res.status(500).json(basicError("Erro ao buscar ações"));
        }
    }

    // --- FIND BY ID COM CÁLCULO DE DISTÂNCIA ---
    static async findById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { userLat, userLon, location } = req.query; // Recebe Params
            
            const acao = await ONGAcaoRepository.findById(id);
            if (!acao) return res.status(404).json(basicError("Ação não encontrada"));
            
            // Lógica de cálculo de distância (Single Item)
            let distanciaInfo = { distancia: '--', pontoReferencia: null as string | null };
            let referencePoints: any[] = [];

            if (userLat && userLon) {
                referencePoints.push({ lat: Number(userLat), lon: Number(userLon), name: "Sua localização" });
            } else if (location) {
                const locations = Array.isArray(location) ? location.map(String) : String(location).split(',');
                if (locations.length > 0) {
                    const bairrosAncoras = await LookupRepository.findBairrosByNames(locations);
                    referencePoints = bairrosAncoras.map((b: any) => ({ lat: b.lat, lon: b.lon, name: b.nome }));
                }
            }

            // Fallback lat/lon
            let lat = Number(acao.lat);
            let lon = Number(acao.lon);
            if (!lat || !lon || (lat === 0 && lon === 0)) {
                lat = Number(acao.ong?.lat);
                lon = Number(acao.ong?.lon);
            }

            if (referencePoints.length > 0 && lat && lon) {
                let minDist = Infinity;
                let closestRefName = null;

                referencePoints.forEach(ref => {
                    const d = getDistanceFromLatLonInKm(ref.lat, ref.lon, lat, lon);
                    if (d < minDist) {
                        minDist = d;
                        closestRefName = ref.name;
                    }
                });

                if (minDist !== Infinity) {
                    distanciaInfo = {
                        distancia: minDist.toFixed(1) + 'km',
                        pontoReferencia: closestRefName
                    };
                }
            }

            // MERGE do Mapper com os dados calculados
            return res.status(200).json({
                ...ONGMapper.toCompleteAcaoResponse(acao),
                ...distanciaInfo
            });

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
import {Request, Response} from "express"
import ONGRepository from "../repositories/ONGRepository"
import basicError from "../utils/BasicError"
import CreateONG from "../repositories/dto/ONGCreateDto"
import ONGMapper from './mappers/ONGMapper';
import bcrypt from "bcrypt"
import ONGContactRepository from "../repositories/ONGContactRepository";
import {BUCKET_NAME, minioClient} from "../minio";
import ONGUpdateDto from "../repositories/dto/ONGUpdateDto";
import jwt from "jsonwebtoken";
import { getDistanceFromLatLonInKm } from "../utils/GeometryUtils";
import LookupRepository from "../repositories/LookupRepository";

export default class ONGController {

    static async create(req: Request, res: Response): Promise<any> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(req.body.login)) {
            return res.status(400).json(
                basicError("O campo 'login' deve ser um email válido")
            );
        }

        const createONG: CreateONG = req.body;

        if (!Array.isArray(createONG.localizacao) || createONG.localizacao.length !== 2) {
            return res.status(400).json(
                basicError("O campo 'localizacao' deve ser um array [latitude, longitude]")
            );
        }

        const [latitude, longitude] = createONG.localizacao;

        try {
            const existsLogin = await ONGRepository.existsByLogin(createONG.login);

            if (existsLogin) {
                return res.status(400).json(basicError("Este email já está em uso"));
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json(basicError("Erro ao verificar login"));
        }

        try {
            const reverseURL =
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`;

            const reverseGeoResponse = await fetch(reverseURL, {
                headers: {
                    "User-Agent": "AcolheMais/1.0 (contato@acolhemais.com)"
                }
            });

            const data = await reverseGeoResponse.json();
            const addr = data.address || {};

            const bairro =
                addr.suburb ||
                addr.neighbourhood ||
                addr.village ||
                "Bairro não identificado";

            const cidade =
                addr.city ||
                addr.town ||
                addr.municipality ||
                addr.county ||
                "Cidade não identificada";

            const estado = addr.state || "Estado não identificado";

            createONG.endereco = `${bairro}, ${cidade} - ${estado}`;
        } catch (err) {
            console.error(err);
            createONG.endereco = "Não localizada";
        }

        try {
            createONG.senha = await bcrypt.hash(createONG.senha, 10);
        } catch (err) {
            console.error(err);
            return res.status(500).json(basicError("Erro ao processar senha"));
        }

        let savedOng;
        try {
            savedOng = await ONGRepository.save(createONG);
        } catch (err) {
            console.error(err);
            return res.status(500).json(basicError("Erro ao salvar ONG"));
        }

        try {
            const token = jwt.sign(
                { id: savedOng.id },
                process.env.SECRET_KEY as string,
                { expiresIn: "30d" }
            );

            res.cookie("AccessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie("ongId", savedOng.id, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
        } catch (err) {
            console.error("Erro ao gerar cookies:", err);
        }

        return res.status(201).json(
            ONGMapper.toCompleteResponse(savedOng)
        );
    }


    static async updateDescription(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            let {description}: string = req.body
            if (!description) {
                description = "Não há descrição"
            }
            const savedOng = await ONGRepository.updateDescription(id, description)
            return res.status(200).json(
                ONGMapper.toCompleteResponse(savedOng)
            )
        } catch (error) {
            return res.status(500).json(basicError("Erro ao tentar salvar ONG, tente novamente mais tarde"));
        }
    }

    static async updatePassword(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            const {password}: string = req.body
            const hashedPassword = await bcrypt.hash(password, 10)
            await ONGRepository.updatePassword(id, hashedPassword)
            return res.status(200).end();
        } catch (error) {
            return res.status(500).json(basicError("Erro ao trocar senha da ONG, tente novamente mais tarde"));
        }
    }

    static async update(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            const ongUpdateDto: ONGUpdateDto = req.body
            await ONGRepository.update(id, ongUpdateDto)
            return res.status(200).end();
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao trocar senha da ONG, tente novamente mais tarde"));
        }
    }

    static async addContact(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            const contact = await ONGContactRepository.addContact(id, req.body)
            res.status(201).json(ONGMapper.toContactResponse(contact))
        } catch (error) {
            console.log(error)
            return res.status(500).json(basicError("Erro ao tentar salvar o contato da ONG, tente novamente mais tarde"));
        }
    }

    static async removeContact(req: Request, res: Response): Promise<any> {
        try {
            const {id} = req.params;
            await ONGContactRepository.removeContact(id)
            res.status(204).end()
        } catch (error) {
            return res.status(500).json(basicError("Erro ao tentar remover o contato da ONG, tente novamente mais tarde"));
        }
    }

    // --- LÓGICA DE RECOMENDAÇÃO CORRIGIDA ---
    static async findAll(req: Request, res: Response): Promise<any> {
        try {
            const { location, search, category, target, userLat, userLon } = req.query;

            const toArray = (p: any) => (!p ? [] : Array.isArray(p) ? p.map(String) : String(p).split(',').filter(x => x.trim() !== ''));
            const locations = toArray(location); // Ex: ['Água Fria', 'Santo Amaro']
            const categories = toArray(category);
            const targets = toArray(target);
            const searchTerm = search ? String(search) : undefined;

            // Busca no banco
            const ongs = await ONGRepository.findAll({
                search: searchTerm,
                category: categories.length > 0 ? categories : undefined, 
                target: targets.length > 0 ? targets : undefined
            });

            // Configuração Algoritmo
            const WEIGHT_CONTENT = 0.4;
            const WEIGHT_DISTANCE = 0.6;
            const MAX_RADIUS_KM = 10; 

            // 1. PREPARAÇÃO DOS PONTOS DE REFERÊNCIA
            let referencePoints: any[] = [];

            // A: GPS do Usuário
            if (userLat && userLon) {
                referencePoints.push({
                    lat: Number(userLat),
                    lon: Number(userLon),
                    name: "Sua localização"
                });
            } 
            // B: Filtros de Bairro (Ex: Água Fria E Santo Amaro)
            else if (locations.length > 0) {
                const bairrosAncoras = await LookupRepository.findBairrosByNames(locations);
                
                // Mapeia TODOS os bairros selecionados
                referencePoints = bairrosAncoras.map((b: any) => ({
                    lat: b.lat,
                    lon: b.lon,
                    name: b.nome
                }));
            }

            const userInterestsSet = new Set([...categories, ...targets]);

            // 2. CÁLCULO E ITERAÇÃO
            let processedOngs = ongs.map((ong: any) => {
                let overlapScore = 0;
                let normalizedDistScore = 0;
                let debugJaccard = 0; 

                let bestMatch = {
                    distance: Infinity,
                    name: null as string | null
                };

                const lat = Number(ong.lat);
                const lon = Number(ong.lon);

                if (referencePoints.length > 0 && lat && lon) {
                    // DEBUG: Descomente para ver a "corrida" no terminal
                    // console.log(`\n--- Calculando para ONG: ${ong.nome} ---`);

                    referencePoints.forEach(ref => {
                        const d = getDistanceFromLatLonInKm(
                            ref.lat, ref.lon,
                            lat, lon
                        );
                        
                        // DEBUG
                        // console.log(`Distância até ${ref.name}: ${d.toFixed(2)}km`);

                        // Se encontrou uma distância MENOR que a atual vencedora, atualiza TUDO
                        if (d < bestMatch.distance) {
                            bestMatch.distance = d;
                            bestMatch.name = ref.name;
                        }
                    });
                    
                    console.log(`🏆 VENCEDOR: ${bestMatch.name} (${bestMatch.distance.toFixed(2)}km)`);

                    // Normaliza a distância vencedora
                    if (bestMatch.distance < MAX_RADIUS_KM) {
                        normalizedDistScore = 1 - (bestMatch.distance / MAX_RADIUS_KM);
                    } else {
                        normalizedDistScore = 0;
                    }
                }

                // B. Conteúdo (Overlap)
                if (userInterestsSet.size > 0) {
                    const ongTags = new Set([
                        ...ong.ongNecessidade.map((n: any) => n.necessidade.tipo),
                        ...ong.ongPublicoAlvo.map((p: any) => p.publicoAlvo.tipo)
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
                    ...ong, 
                    distanceKm: bestMatch.distance, // Usa a distância vencedora
                    closestRefName: bestMatch.name, // Usa o nome vencedor
                    relevanceScore: overlapScore, 
                    distScore: normalizedDistScore,
                    finalScore: finalScore,
                    debugJaccard: debugJaccard
                };
            });

            // 3. Ordenação
            processedOngs.sort((a: any, b: any) => b.finalScore - a.finalScore);

            // Filtro textual de fallback (caso GPS falhe totalmente)
            if (locations.length > 0 && referencePoints.length === 0) {
                processedOngs = processedOngs.filter((ong: any) => 
                     locations.some(loc => ong.endereco.includes(loc))
                );
            }

            return res.status(200).json(
                processedOngs.map((ong: any) => ({
                    ...ONGMapper.toCompleteResponse(ong),
                    
                    scoreFinal: (ong.finalScore * 100).toFixed(0),
                    scoreOverlap: (ong.relevanceScore * 100).toFixed(0) + '%',
                    scoreJaccard: (ong.debugJaccard * 100).toFixed(0) + '%',
                    distancia: ong.distanceKm !== Infinity ? ong.distanceKm.toFixed(1) + 'km' : '--',
                    
                    // Envia para o frontend APENAS o nome do bairro mais próximo calculado acima
                    pontoReferencia: ong.closestRefName 
                }))
            );

        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro ao processar ONGs"));
        }
    }

    static async findById(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        // 1. Recebe os parametros de localização
        const { userLat, userLon, location } = req.query;

        try {
            const ong = await ONGRepository.findById(id);
            if (!ong) return res.status(404).json(basicError("ONG não encontrada."));

            // 2. Lógica de Cálculo (Simplificada para 1 item)
            let distanciaInfo = { distancia: '--', pontoReferencia: null as string | null };
            
            // Define pontos de referência (GPS ou Filtro de Texto)
            let referencePoints: any[] = [];
            
            if (userLat && userLon) {
                referencePoints.push({ lat: Number(userLat), lon: Number(userLon), name: "Sua localização" });
            } else if (location) {
                // Se vier via query string (ex: ?location=Recife,Olinda)
                const locations = Array.isArray(location) ? location.map(String) : String(location).split(',');
                if (locations.length > 0) {
                    const bairrosAncoras = await LookupRepository.findBairrosByNames(locations);
                    referencePoints = bairrosAncoras.map((b: any) => ({ lat: b.lat, lon: b.lon, name: b.nome }));
                }
            }

            // Calcula
            if (referencePoints.length > 0 && ong.lat && ong.lon) {
                let minDist = Infinity;
                let closestRefName = null;

                referencePoints.forEach(ref => {
                    const d = getDistanceFromLatLonInKm(ref.lat, ref.lon, Number(ong.lat), Number(ong.lon));
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

            // 3. Retorna objeto mesclado
            return res.status(200).json({
                ...ONGMapper.toCompleteResponse(ong),
                ...distanciaInfo
            });

        } catch (error) {
            return res.status(500).json(basicError("Erro ao buscar ONG"));
        }
    }

    static async saveLogo(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const ong = await ONGRepository.findById(id);
            if (!ong) {
                return res.status(404).json(basicError("ONG não encontrada."));
            }
            minioClient.putObject(BUCKET_NAME, `${id}-logo`, req.file.buffer, (err, etag) => {
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

    static async getLogo(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const ong = await ONGRepository.findById(id);
            if (!ong) {
                return res.status(404).json(basicError("ONG não encontrada."));
            }
            res.setHeader('Content-Type', 'image/png');
            minioClient.getObject(BUCKET_NAME, `${id}-logo`, (err, dataStream) => {
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

    static async addImage(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const ong = await ONGRepository.findById(id);
            if (!ong) {
                return res.status(404).json(basicError("ONG não encontrada."));
            }
            const filename = crypto.randomUUID()
            minioClient.putObject(BUCKET_NAME, filename, req.file.buffer, async (err, etag) => {
                if (err) {
                    return res.status(500).json({message: 'Erro ao enviar o arquivo para o MinIO', error: err});
                }
                await ONGRepository.addImage(id, filename)
            });
            res.status(201).end();
        } catch (e) {
            return res.status(500).json(basicError(e));
        }
    }

    static async getImage(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const image = await ONGRepository.getImage(id);
            if (!image) {
                return res.status(404).json(basicError("Imagem não encontrada."));
            }
            minioClient.getObject(BUCKET_NAME, image.filename, (err, dataStream) => {
                if (err) {
                    return res.status(404).json({message: 'Arquivo não encontrado', error: err});
                }
                res.setHeader('Content-Type', 'image/png');
                dataStream.pipe(res);
            });
        } catch (e) {
            return res.status(500).json(basicError(e));
        }
    }

    static async removeImage(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const image = await ONGRepository.getImage(id);
            if (!image) {
                return res.status(404).json(basicError("Imagem não encontrada."));
            }
            minioClient.removeObject(BUCKET_NAME, image.filename, (err, _) => {
                if (err) {
                    return res.status(404).json({message: 'Arquivo não encontrado', error: err});
                }
            });
            await ONGRepository.deleteImage(id);
            return res.status(204).end();
        } catch (e) {
            return res.status(500).json(basicError(e));
        }
    }

    static async delete(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        try {
            await ONGRepository.delete(id);
            return res.status(204).end();
        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro ao excluir a conta da ONG. Tente novamente."));
        }
    }
}

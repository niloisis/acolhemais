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

    /*static async findAll(req: Request, res: Response): Promise<any> {
        try {
            const { location, search, category, target, userLat, userLon } = req.query;

            // Normaliza filtros
            const toArray = (p: any) => (!p ? [] : Array.isArray(p) ? p.map(String) : String(p).split(',').filter(x => x.trim() !== ''));
            const locations = toArray(location);
            const categories = toArray(category);
            const targets = toArray(target);
            const searchTerm = search ? String(search) : undefined;

            // 1. Busca ONGs (Mantendo filtros de banco para performance base)
            const ongs = await ONGRepository.findAll({
                search: searchTerm,
                category: categories.length > 0 ? categories : undefined, 
                target: targets.length > 0 ? targets : undefined
            });

            // 2. INICIALIZAÇÃO SEGURA (Cria os campos com valor padrão para todos)
            let processedOngs = ongs.map((ong: any) => ({
                ...ong,
                distanceKm: Infinity, // Padrão: muito longe
                jaccardScore: 0       // Padrão: sem relevância
            }));

            // 3. DEFINE PONTO DE REFERÊNCIA (GPS ou Bairro)
            let referencePoint = { lat: 0, lon: 0, active: false, name: "" };

            if (userLat && userLon) {
                referencePoint = { lat: Number(userLat), lon: Number(userLon), active: true, name: "Sua localização" };
            } 
            else if (locations.length > 0) {
                const bairrosAncoras = await LookupRepository.findBairrosByNames(locations);
                if (bairrosAncoras.length > 0) {
                    referencePoint = { 
                        lat: bairrosAncoras[0].lat, 
                        lon: bairrosAncoras[0].lon, 
                        active: true,
                        name: bairrosAncoras[0].nome
                    };
                }
            }

            // 4. CÁLCULOS (Content-Based + Geolocation)
            const userInterestsSet = new Set([...categories, ...targets]);

            processedOngs = processedOngs.map((ong: any) => {
                let dist = Infinity;
                let jaccard = 0;

                // --- A. Distância (Haversine) ---
                if (referencePoint.active && ong.lat && ong.lon) {
                    dist = getDistanceFromLatLonInKm(
                        referencePoint.lat, referencePoint.lon,
                        Number(ong.lat), Number(ong.lon)
                    );
                }

                // --- B. Relevância (Jaccard) ---
                if (userInterestsSet.size > 0) {
                    const ongTags = new Set([
                        ...ong.ongNecessidade.map((n: any) => n.necessidade.tipo),
                        ...ong.ongPublicoAlvo.map((p: any) => p.publicoAlvo.tipo)
                    ]);

                    const intersection = new Set([...userInterestsSet].filter(x => ongTags.has(x)));
                    const union = new Set([...userInterestsSet, ...ongTags]);

                    if (union.size > 0) {
                        jaccard = intersection.size / union.size;
                    }
                }

                return { ...ong, distanceKm: dist, jaccardScore: jaccard };
            });

            // 5. FILTRAGEM POR RAIO (Apenas se tiver ponto de referência ativo)
            // Se filtrou por local, mostra raio de 5km (pega vizinhos). Se não, mostra tudo.
            if (referencePoint.active) {
                processedOngs = processedOngs.filter((ong: any) => ong.distanceKm <= 5);
            }

            // 6. ORDENAÇÃO (O CORAÇÃO DO ALGORITMO)
            processedOngs.sort((a: any, b: any) => {
                // Fator 1: Jaccard (Maior score ganha) - Peso alto
                if (Math.abs(b.jaccardScore - a.jaccardScore) > 0.01) { // 0.01 para evitar flutuação de float
                    return b.jaccardScore - a.jaccardScore;
                }
                
                // Fator 2: Distância (Menor distância ganha) - Desempate
                return a.distanceKm - b.distanceKm;
            });

            // 7. Fallback Textual (Se usuário digitou bairro mas bairro não tem lat/lon)
            if (locations.length > 0 && !referencePoint.active) {
                processedOngs = processedOngs.filter((ong: any) => 
                     locations.some(loc => ong.endereco.includes(loc))
                );
            }

            // 8. Retorno
            return res.status(200).json(
                processedOngs.map((ong: any) => ({
                    ...ONGMapper.toCompleteResponse(ong),
                    // Debug: Retorne esses valores para testar no navegador se a ordenação funcionou
                    _debugDistance: ong.distanceKm,
                    _debugScore: ong.jaccardScore,
                    
                    referencia: referencePoint.active && ong.distanceKm < 2 
                        ? `Próximo a ${referencePoint.name}` 
                        : null
                }))
            );

        } catch (error) {
            console.error("Erro no ONGController:", error);
            return res.status(500).json(basicError("Erro ao processar ONGs"));
        }
    }*/

    static async findAll(req: Request, res: Response): Promise<any> {
        try {
            const { location, search, category, target, userLat, userLon } = req.query;

            const toArray = (p: any) => (!p ? [] : Array.isArray(p) ? p.map(String) : String(p).split(',').filter(x => x.trim() !== ''));
            const locations = toArray(location);
            const categories = toArray(category);
            const targets = toArray(target);
            const searchTerm = search ? String(search) : undefined;

            // Busca no banco (Filtro grosso)
            const ongs = await ONGRepository.findAll({
                search: searchTerm,
                category: categories.length > 0 ? categories : undefined, 
                target: targets.length > 0 ? targets : undefined
            });

            // --- CONFIGURAÇÃO DO ALGORITMO (60/40) ---
            const WEIGHT_CONTENT = 0.4;  // 40% Peso para Overlap
            const WEIGHT_DISTANCE = 0.6; // 60% Peso para Distância
            const MAX_RADIUS_KM = 15;    // Raio máximo considerado (acima disso nota de dist é 0)

            // Inicializa ponto de referência
            let referencePoint = { lat: 0, lon: 0, active: false, name: "" };

            if (userLat && userLon) {
                referencePoint = { lat: Number(userLat), lon: Number(userLon), active: true, name: "Sua localização" };
            } 
            else if (locations.length > 0) {
                const bairrosAncoras = await LookupRepository.findBairrosByNames(locations);
                if (bairrosAncoras.length > 0) {
                    referencePoint = { 
                        lat: bairrosAncoras[0].lat, 
                        lon: bairrosAncoras[0].lon, 
                        active: true,
                        name: bairrosAncoras[0].nome
                    };
                }
            }

            const userInterestsSet = new Set([...categories, ...targets]);

            // CÁLCULO DOS SCORES
            let processedOngs = ongs.map((ong: any) => {
                let dist = Infinity;
                let overlapScore = 0;
                let normalizedDistScore = 0;
                let debugJaccard = 0; // Só para evidência no TCC

                // 1. Distância Real e Normalizada
                if (referencePoint.active && ong.lat && ong.lon) {
                    dist = getDistanceFromLatLonInKm(
                        referencePoint.lat, referencePoint.lon,
                        Number(ong.lat), Number(ong.lon)
                    );

                    // Normaliza (0 a 1): Quanto mais perto, maior a nota
                    if (dist < MAX_RADIUS_KM) {
                        normalizedDistScore = 1 - (dist / MAX_RADIUS_KM);
                    } else {
                        normalizedDistScore = 0;
                    }
                }

                // 2. Score de Conteúdo (Overlap vs Jaccard)
                if (userInterestsSet.size > 0) {
                    const ongTags = new Set([
                        ...ong.ongNecessidade.map((n: any) => n.necessidade.tipo),
                        ...ong.ongPublicoAlvo.map((p: any) => p.publicoAlvo.tipo)
                    ]);
                    
                    const intersection = [...userInterestsSet].filter(x => ongTags.has(x)).length;
                    const union = new Set([...userInterestsSet, ...ongTags]).size;

                    // OVERLAP (O ESCOLHIDO): Foca na satisfação do usuário
                    overlapScore = intersection / userInterestsSet.size;

                    // JACCARD (PARA COMPARATIVO): Penaliza tags extras
                    if (union > 0) debugJaccard = intersection / union;

                } else {
                    // Se usuário não filtrou interesses, assumimos relevância total de conteúdo
                    // para que a ordenação seja puramente por distância
                    overlapScore = 1;
                }

                // 3. Score Final Ponderado
                let finalScore = 0;
                
                // Se o usuário pediu filtros de interesse, só damos score se houver match.
                // Se ele não pediu nada (userInterestsSet.size == 0), o score é baseado 100% na distância (overlap é 1).
                if (overlapScore > 0) {
                    finalScore = (overlapScore * WEIGHT_CONTENT) + (normalizedDistScore * WEIGHT_DISTANCE);
                }

                return { 
                    ...ong, 
                    distanceKm: dist, 
                    relevanceScore: overlapScore, 
                    distScore: normalizedDistScore,
                    finalScore: finalScore,
                    debugJaccard: debugJaccard
                };
            });

            // ORDENAÇÃO (Maior Score Final Vence)
            processedOngs.sort((a: any, b: any) => b.finalScore - a.finalScore);

            // Fallback para busca textual simples se não houver GPS
            if (locations.length > 0 && !referencePoint.active) {
                processedOngs = processedOngs.filter((ong: any) => 
                     locations.some(loc => ong.endereco.includes(loc))
                );
            }

            return res.status(200).json(
                processedOngs.map((ong: any) => ({
                    ...ONGMapper.toCompleteResponse(ong),
                    
                    // Dados para mostrar no Card (Evidência TCC)
                    scoreFinal: (ong.finalScore * 100).toFixed(0), // Ex: "85"
                    scoreOverlap: (ong.relevanceScore * 100).toFixed(0) + '%',
                    scoreJaccard: (ong.debugJaccard * 100).toFixed(0) + '%', // Mostra o Jaccard só pra comparar
                    distancia: ong.distanceKm !== Infinity ? ong.distanceKm.toFixed(1) + 'km' : '--',
                    
                    referencia: referencePoint.active && ong.distanceKm < 3 
                        ? `Próximo a ${referencePoint.name}` 
                        : null
                }))
            );

        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro ao processar ONGs"));
        }
    }

    static async findById(req: Request, res: Response): Promise<any> {
        const {id} = req.params;
        try {
            const ong = await ONGRepository.findById(id);
            if (!ong) {
                return res.status(404).json(basicError("ONG não encontrada."));
            }
            return res.status(200).json(
                ONGMapper.toCompleteResponse(ong)
            );
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

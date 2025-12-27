import { Request, Response } from "express";
import ONGRepository from "../repositories/ONGRepository";
import basicError from "../utils/BasicError";
import ONGMapper from "./mappers/ONGMapper";
import { getDistanceFromLatLonInKm } from "../utils/GeometryUtils";

export default class RecommendationController {

    static async recommend(req: Request, res: Response): Promise<any> {
        try {
            // Recebe dados da Triagem
            // userLat/Lon: onde o usuário está
            // interests: array de strings ['Saúde', 'Alimentação']
            const { userLat, userLon, interests } = req.body;

            if (!userLat || !userLon) {
                return res.status(400).json(basicError("Localização é obrigatória para recomendação."));
            }

            // 1. Busca TODAS as ONGs (sem filtro inicial)
            const allOngs = await ONGRepository.findAll();

            // 2. O ALGORITMO (Content-Based Filtering)
            const scoredOngs = allOngs.map((ong) => {
                let score = 0;
                let distance = 0;

                // --- FATOR 1: DISTÂNCIA (Peso 40% -> Max 40 pontos) ---
                if (ong.lat && ong.lon) {
                    distance = getDistanceFromLatLonInKm(
                        Number(userLat), Number(userLon), 
                        Number(ong.lat), Number(ong.lon)
                    );

                    // Lógica: 
                    // Se distância < 2km: 40 pontos (Máximo)
                    // Se distância > 20km: 0 pontos
                    // Entre isso: decaimento linear
                    const MAX_DIST_KM = 20;
                    if (distance <= 2) {
                        score += 40;
                    } else if (distance < MAX_DIST_KM) {
                        // Regra de três inversa
                        const distanceScore = 40 * (1 - (distance / MAX_DIST_KM));
                        score += distanceScore;
                    }
                }

                // --- FATOR 2: INTERESSE (Peso 60% -> Max 60 pontos) ---
                if (interests && Array.isArray(interests) && interests.length > 0) {
                    // Pega as necessidades/causas que a ONG atende
                    const ongCauses = ong.ongNecessidade.map(n => n.necessidade.tipo);
                    
                    // Conta quantas batem com o que o usuário quer
                    const matches = interests.filter(i => ongCauses.includes(i)).length;
                    
                    if (matches > 0) {
                        // Se usuário pediu 2 coisas e a ONG tem 2: (2/2)*60 = 60 pontos
                        // Se usuário pediu 2 coisas e a ONG tem 1: (1/2)*60 = 30 pontos
                        const interestScore = (matches / interests.length) * 60;
                        score += interestScore;
                    }
                }

                return {
                    ...ong,
                    relevanceScore: score, // Guardamos o score para debug se quiser mostrar
                    distanceKm: distance
                };
            });

            // 3. Ordenação (Maior Score -> Menor Score)
            scoredOngs.sort((a, b) => b.relevanceScore - a.relevanceScore);

            // 4. Retorna (Mapeado)
            // Pegamos apenas o top 20 para não pesar
            const topOngs = scoredOngs.slice(0, 20);

            return res.status(200).json(
                // Precisamos adaptar o mapper ou mapear manualmente aqui se quiser passar o score extra
                ONGMapper.toCompleteResponseList(topOngs) 
            );

        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro ao gerar recomendações"));
        }
    }
}
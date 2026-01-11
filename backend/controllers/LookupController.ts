import { Request, Response } from "express";
import LookupRepository from "../repositories/LookupRepository";
import basicError from "../utils/BasicError";

export default class LookupController {

    static async getNecessidades(req: Request, res: Response): Promise<any> {
        try {
            const list = await LookupRepository.findAllNecessidades();
            return res.json(list);
        } catch (error) {
            return res.status(500).json(basicError("Erro ao buscar necessidades"));
        }
    }

    static async getPublicoAlvo(req: Request, res: Response): Promise<any> {
        try {
            const list = await LookupRepository.findAllPublicoAlvo();
            return res.json(list);
        } catch (error) {
            return res.status(500).json(basicError("Erro ao buscar público alvo"));
        }
    }

    static async getBairros(req: Request, res: Response): Promise<any> {
        try {
            const list = await LookupRepository.findAllBairros();
            return res.json(list);
        } catch (error) {
            return res.status(500).json(basicError("Erro ao buscar bairros"));
        }
    }
}
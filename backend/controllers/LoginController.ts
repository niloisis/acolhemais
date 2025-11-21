import { Request, Response } from "express";
import bcrypt from "bcrypt"; // ou bcryptjs, dependendo do que instalou
import jwt from "jsonwebtoken";
import ONGRepository from "../repositories/ONGRepository";
import basicError from "../utils/BasicError"; // Importe seu utilitário de erro

export default class LoginController {
    static async login(req: Request, res: Response): Promise<any> {
        const { login, senha, lembrar } = req.body; // Recebe 'lembrar' do front

        try {
            const ong = await ONGRepository.findByLogin(login);
            if (!ong) return res.status(401).json(basicError("Credenciais inválidas"));

            const isMatch = await bcrypt.compare(senha, ong.senha);
            if (!isMatch) return res.status(401).json(basicError("Credenciais inválidas"));

            // Lógica do "Lembrar de mim"
            // Se lembrar = true, dura 30 dias. Se não, dura 1 dia (24h).
            const expiration = lembrar ? "30d" : "1d";
            const maxAge = lembrar ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

            const token = jwt.sign({ id: ong.id }, process.env.SECRET_KEY as string, { expiresIn: expiration });

            // --- DEFINIÇÃO DE COOKIES (Faltava isso!) ---
            res.cookie("AccessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: maxAge,
            });
            
            res.cookie("ongId", ong.id, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: maxAge,
            });

            // Retorno do JSON
            return res.status(200).json({
                token: token,
                ongId: ong.id,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json(basicError("Erro interno no servidor"));
        }
    }
}
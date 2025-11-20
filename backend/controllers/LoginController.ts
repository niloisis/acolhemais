import {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ONGRepository from "../repositories/ONGRepository";
import {Ong} from "./@types/ONG";

export default class LoginController {
    static async login(req: Request, res: Response): Promise<any> {
        const {login, senha} = req.body;

        const ong: Ong = await ONGRepository.findByLogin(login);
        if (!ong) return res.status(401).end();

        const isMatch = await bcrypt.compare(senha, ong.senha);
        if (!isMatch) return res.status(401).end();

        const token = jwt.sign({id: ong.id}, process.env.SECRET_KEY as string, {expiresIn: "30d"});
        res.json({
            "token": token,
            "ongId": ong.id,
        });
        res.status(200).end();
    }
}

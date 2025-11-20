import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "SECRET_KEY";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization.split("Bearer ")[1];
        if (!token) {
            return res.status(403).json({error: "Acesso negado. Token não fornecido."});
        }
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number };
        next();
    } catch (error) {
        return res.status(403).json({error: "Token inválido ou expirado."});
    }
}

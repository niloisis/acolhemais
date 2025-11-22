import { Request, Response, NextFunction } from 'express';

export function debugLoginMiddleware(req: Request, res: Response, next: NextFunction) {
    const { ongId, accessToken } = req.cookies;

    if (!ongId || !accessToken) {
        return res.status(401).json({ message: "Não autenticado (modo debug)" });
    }

    next();
}

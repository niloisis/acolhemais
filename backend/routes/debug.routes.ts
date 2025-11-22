import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/debug/login', (req, res) => {
    const ongId = "3dc1b849-53fb-4835-85f6-7d260d987966";

    const accessToken = jwt.sign(
        { ongId },
        "SENHA_SUPER_SECRETA",
        { expiresIn: "1h" }
    );

    res.cookie("ongId", ongId, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
    });

    res.cookie("AccessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
    });

    res.json({
        message: "Debug login ativo",
        cookies: { ongId, accessToken },
        user: null
    });
});

export default router;

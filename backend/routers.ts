import {Router} from "express";
import ONGController from "./controllers/ONGController";
import multer from "multer";
import LoginController from "./controllers/LoginController";
import {authMiddleware} from "./controllers/middleware/authMiddleware";
import ONGAcaoController from "./controllers/ONGAcaoController";
import LookupController from "./controllers/LookupController";
import RecommendationController from "./controllers/RecommendationController";

const upload = multer();
const router = Router();

router.post("/login", LoginController.login);

router.post("/v1/ong", ONGController.create);
router.get("/v1/ong", ONGController.findAll);
router.get('/v1/ong/:id', ONGController.findById);
router.put('/v1/ong/:id/description', authMiddleware, ONGController.updateDescription);
router.put('/v1/ong/:id/password', authMiddleware, ONGController.updatePassword);
router.put('/v1/ong/:id', authMiddleware, ONGController.update);
router.post('/v1/ong/:id/contact', authMiddleware, ONGController.addContact);
router.delete('/v1/ong/contact/:id', authMiddleware, ONGController.removeContact);
router.delete('/v1/ong/:id', authMiddleware, ONGController.delete);
router.post('/v1/ong/:id/acoes', authMiddleware, ONGAcaoController.create);
router.get('/v1/ong/:id/acoes', ONGAcaoController.findAllByOng);

router.get('/v1/acoes', ONGAcaoController.findAll);
router.get('/v1/acoes/:id', ONGAcaoController.findById);
router.delete('/v1/acoes/:id', authMiddleware, ONGAcaoController.delete);
router.put('/v1/acoes/:id', authMiddleware, ONGAcaoController.update);
router.post('/v1/acoes/:id/banner', upload.single('banner'), ONGAcaoController.changeBanner);
router.get('/v1/acoes/:id/banner', ONGAcaoController.getBanner);

router.post('/v1/ong/:id/logo', upload.single('logo'), ONGController.saveLogo);
router.get('/v1/ong/:id/logo', ONGController.getLogo);

router.post('/v1/ong/:id/image', upload.single('picture'), ONGController.addImage);
router.delete('/v1/ong/:id/image', ONGController.removeImage);
router.get('/v1/ong-image/:id', ONGController.getImage);

router.get('/v1/necessidades', LookupController.getNecessidades);
router.get('/v1/publico-alvo', LookupController.getPublicoAlvo);
router.get('/v1/bairros', LookupController.getBairros);

router.post('/v1/recommend', RecommendationController.recommend);

export default router;

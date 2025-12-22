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

    /*static async findAll(_: Request, res: Response): Promise<any> {
        return res.status(200).json(
            ONGMapper.toCompleteResponseList(
                await ONGRepository.findAll()
            )
        )
    }*/

    static async findAll(req: Request, res: Response): Promise<any> {
        try {
            const { location, category, target } = req.query;

            // Função auxiliar para converter string separada por vírgula em array
            const toArray = (param: any) => {
                if (!param) return [];
                if (Array.isArray(param)) return param.map(String);
                return String(param).split(',');
            };

            const ongs = await ONGRepository.findAll({
                location: location as string,
                category: toArray(category), // Converte "Saúde,Educação" -> ["Saúde", "Educação"]
                target: toArray(target)
            });

            return res.status(200).json(
                ONGMapper.toCompleteResponseList(ongs)
            );
        } catch (error) {
            console.error("Erro no Controller findAll:", error);
            return res.status(500).json(basicError("Erro ao buscar ONGs"));
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

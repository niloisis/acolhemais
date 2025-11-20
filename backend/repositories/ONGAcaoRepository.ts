import db from "../db";
import ONGAcaoCreateRequest from "./dto/ONGAcaoCreateDto";

class ONGRepository {

    async save(ongAcaoCreateRequest: ONGAcaoCreateRequest) {
        return db.acao.create({
            data: {
                nome: ongAcaoCreateRequest.nome,
                dia: ongAcaoCreateRequest.dia,
                mes: ongAcaoCreateRequest.mes,
                ano: ongAcaoCreateRequest.ano,
                inicio: ongAcaoCreateRequest.inicio,
                termino: ongAcaoCreateRequest.termino,
                cep: ongAcaoCreateRequest.cep,
                bairro: ongAcaoCreateRequest.bairro,
                endereco: ongAcaoCreateRequest.endereco,
                numero: ongAcaoCreateRequest.numero,
                complemento: ongAcaoCreateRequest.complemento,
                descricao: "Não há descrição sobre este evento",
                como_participar: "Adicione informações sobre como participar deste evento",
                link_contato: "",
                ong: {
                    connect: {
                        id: ongAcaoCreateRequest.ondId
                    },
                },
            },
            include: {
                ong: true
            },
        });
    }

    async findAllByOng(ongId) {
        return db.acao.findMany({
            where: {
                ongId: ongId,
            }, include: {
                ong: true
            }
        });
    }

    async findAll() {
        return db.acao.findMany({
            include: {
                ong: true
            }
        });
    }

    async findById(id) {
        return db.acao.findFirstOrThrow({
            where: {
                id: id,
            }, include: {
                ong: true
            }
        });
    }

    async update(id: string, {descricao, como_participar, link_contato}: {
        descricao: string,
        como_participar: string,
        link_contato: string
    }) {
        return db.acao.update({
            where: {id},
            data: {
                descricao,
                como_participar,
                link_contato
            }
        });
    }

    async delete(id: string) {
        return db.acao.delete({
            where: {id}
        });
    }
}

export default new ONGRepository() 



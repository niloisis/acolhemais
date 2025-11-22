import db from "../db";
import ONGAcaoCreateRequest from "./dto/ONGAcaoCreateDto";

class AcaoRepository {

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
                        id: ongAcaoCreateRequest.ongId, // <-- corrigido
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
            where: { ongId },
            include: { ong: true }
        });
    }

    async findAll() {
        return db.acao.findMany({
            include: { ong: true }
        });
    }

    async findById(id) {
        return db.acao.findFirstOrThrow({
            where: { id },
            include: { ong: true }
        });
    }

    async update(id, { descricao, como_participar, link_contato }) {
        return db.acao.update({
            where: { id },
            data: { descricao, como_participar, link_contato },
            include: { ong: true } // <-- garante que o frontend sempre receba ong correta
        });
    }

    async delete(id) {
        return db.acao.delete({
            where: { id }
        });
    }
}

export default new AcaoRepository();

import db from '../db.ts';
import ONGAcaoCreateRequest from "./dto/ONGAcaoCreateDto";

class ONGAcaoRepository {

    async save(data: ONGAcaoCreateRequest) {
        
        // Monta endereço formatado
        const enderecoFormatado = `${data.logradouro}, ${data.numero} - ${data.bairro}`;

        return db.acao.create({
            data: {
                nome: data.nome,
                dia: data.dia,
                mes: data.mes,
                ano: data.ano,
                inicio: data.inicio,
                termino: data.termino,
                descricao: data.descricao || "",
                como_participar: data.como_participar || "",
                link_contato: data.link_contato || "",

                // --- PADRONIZAÇÃO ---
                cep: data.cep,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                endereco: enderecoFormatado,
                
                // Conecta Bairro
                bairro: {
                    connect: { nome: data.bairro }
                },

                // Salva Lat/Lon se vierem (opcional na ação)
                lat: data.localizacao ? data.localizacao[0] : null,
                lon: data.localizacao ? data.localizacao[1] : null,
                
                // Conecta ONG
                ong: {
                    connect: { id: data.ongId }
                }
            },
            include: {
                bairro: true // Inclui dados do bairro
            }
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

export default new ONGAcaoRepository();

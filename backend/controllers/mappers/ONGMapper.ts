import { AcaoResponse, Contact, ONGCompleteResponse } from "../../repositories/dtos/ONGResponseDtos";

export default class ONGMapper {

    static toCompleteResponse(ong: any): ONGCompleteResponse {
        return {
            id: ong.id,
            login: ong.login,
            nome: ong.nome,
            descricao: ong.descricao,
            cnpj: ong.cnpj,
            data_criacao: ong.data_criacao,
            
            // Endereço Formatado (Ex: "Rua X, 123 - Bairro Y")
            endereco: ong.endereco || "",

            // Campos Detalhados (Para preencher formulários de edição)
            cep: ong.cep || "",
            logradouro: ong.logradouro || "",
            numero: ong.numero || "",
            complemento: ong.complemento || "",
            // IMPORTANTE: Se o bairro vier populado (relation), pega o nome. Se não, string vazia.
            bairro: ong.bairro?.nome || "", 

            localizacao: {
                latitude: ong.lat || 0,
                longitude: ong.lon || 0,
            },
            
            necessidades: ong?.ongNecessidade?.map((ongNecessidade: any) => ({
                id: ongNecessidade.id,
                tipo: ongNecessidade.necessidade.tipo
            })) || [],
            
            images: ong?.ongImage?.map((image: any) => image.id) || [],
            
            publico_alvo: ong?.ongPublicoAlvo?.map((ongPublicoAlvo: any) => ({
                id: ongPublicoAlvo.id,
                tipo: ongPublicoAlvo.publicoAlvo.tipo
            })) || [],
            
            contatos: ong?.ongContato?.map((contato: any) => {
                return ONGMapper.toContactResponse(contato)
            }) || []
        }
    }

    static toCompleteAcaoResponse(acao: any): AcaoResponse {
        return {
            id: acao?.id,
            ongId: acao.ongId || acao.ong?.id, // Garante pegar o ID da ONG
            nome: acao.nome,
            
            dia: acao.dia,
            mes: acao.mes,
            ano: acao.ano,
            inicio: acao.inicio,
            termino: acao.termino,
            
            descricao: acao.descricao,
            como_participar: acao.como_participar,
            link_contato: acao.link_contato,

            // Endereço
            endereco: acao.endereco || "", // Formatado
            cep: acao.cep || "",
            logradouro: acao.logradouro || "",
            numero: acao.numero || "",
            complemento: acao.complemento || undefined,
            // Pega o nome do bairro da relação ou direto se for legado
            bairro: acao.bairro?.nome || acao.bairro || "", 

            // Geo (Se a ação tiver localização específica)
            localizacao: (acao.lat && acao.lon) ? {
                latitude: acao.lat,
                longitude: acao.lon
            } : undefined
        }
    }

    static toCompleteAcaoResponseList(acao: any[]): AcaoResponse[] {
        return acao.map(o => this.toCompleteAcaoResponse(o));
    }

    static toCompleteResponseList(ong: any[]): ONGCompleteResponse[] {
        return ong.map(o => this.toCompleteResponse(o));
    }

    static toContactResponse(contato: any): Contact {
        return {
            id: contato.id,
            tipo: contato.tipoContato?.tipo || contato.tipo, // Proteção caso venha aninhado
            valor: contato.valor
        }
    }
}
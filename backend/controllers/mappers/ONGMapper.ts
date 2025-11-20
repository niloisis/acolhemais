import {AcaoResponse, Contact, ONGCompleteResponse} from "../dtos/ONGResponseDtos"

export default class ONGMapper {

    static toCompleteResponse(ong): ONGCompleteResponse {
        return {
            id: ong.id,
            login: ong.login,
            nome: ong.nome,
            descricao: ong.descricao,
            cnpj: ong.cnpj,
            data_criacao: ong.data_criacao,
            endereco: ong.endereco,
            localizacao: {
                latitude: ong.lat,
                longitude: ong.lon,
            },
            necessidades: ong?.ongNecessidade?.map(ongNecessidade => (
                {
                    id: ongNecessidade.id,
                    tipo: ongNecessidade.necessidade.tipo
                }
            )) || [],
            images: ong?.ongImage?.map(image =>
                image.id,
            ) || [],
            publico_alvo: ong?.ongPublicoAlvo?.map(ongPublicoAlvo => (
                {
                    id: ongPublicoAlvo.id,
                    tipo: ongPublicoAlvo.publicoAlvo.tipo
                }
            )) || [],
            contatos: ong?.ongContato?.map(contato => {
                return ONGMapper.toContactResponse(contato)
            }) || []
        }
    }

    static toCompleteAcaoResponse(acao): AcaoResponse {
        return {
            id: acao?.id,
            nome: acao.nome,
            dia: acao.dia,
            mes: acao.mes,
            ano: acao.ano,
            inicio: acao.inicio,
            termino: acao.termino,
            cep: acao.cep,
            bairro: acao.bairro,
            endereco: acao.endereco,
            numero: acao.numero,
            complemento: acao.complemento || undefined,
            descricao: acao.descricao,
            ongId: acao.ong.id,
            como_participar: acao.como_participar,
            link_contato: acao.link_contato,
        }
    }

    static toCompleteAcaoResponseList(acao): AcaoResponse[] {
        return acao.map(o => this.toCompleteAcaoResponse(o)
        )
    }

    static toCompleteResponseList(ong): ONGCompleteResponse[] {
        return ong.map(o => this.toCompleteResponse(o)
        )
    }

    static toContactResponse(contato): Contact {
        return {
            id: contato.id,
            tipo: contato.tipoContato.tipo,
            valor: contato.valor
        }
    }
}

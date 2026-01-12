import db from '../db';
import ONGAcaoCreateRequest from "./dto/ONGAcaoCreateDto";

class ONGAcaoRepository {

    // Helper 1: Converter nome do mês em número
    private getMonthIndex(mesNome: string): number {
        const meses: { [key: string]: number } = {
            "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, "Maio": 4, "Junho": 5,
            "Julho": 6, "Agosto": 7, "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11
        };
        const key = mesNome ? mesNome.charAt(0).toUpperCase() + mesNome.slice(1).toLowerCase() : "";
        return meses[key] !== undefined ? meses[key] : 0;
    }

    // Helper 2: Calcular Timestamp (usado apenas para ORDENAÇÃO)
    private getDateFromAcao(acao: any): number {
        const ano = acao.ano || 2099;
        const mes = this.getMonthIndex(acao.mes);
        const dia = acao.dia || 1;
        
        let hora = 23; 
        let min = 59;
        
        // Tenta extrair hora do término para precisão
        if (acao.termino && acao.termino.includes(':')) {
            const parts = acao.termino.split(':');
            hora = parseInt(parts[0]);
            min = parseInt(parts[1]);
        }

        return new Date(ano, mes, dia, hora, min).getTime();
    }

    async save(data: ONGAcaoCreateRequest) {
        
        // Monta endereço formatado
        const enderecoFormatado = `${data.logradouro}, ${data.numero} - ${data.bairro}, Recife - PE`;

        return db.acao.create({
            data: {
                nome: data.nome,
                descricao: data.descricao || "",
                
                // --- REMOVIDO O CAMPO 'data' QUE CAUSAVA O ERRO ---
                // Não salvamos 'data', apenas dia/mes/ano
                
                dia: data.dia,
                mes: data.mes,
                ano: data.ano,
                inicio: data.inicio,
                termino: data.termino,
                como_participar: data.como_participar || "",
                link_contato: data.link_contato || "",

                // --- PADRONIZAÇÃO ---
                cep: data.cep,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                endereco: enderecoFormatado,
                
                // Conecta ou Cria Bairro
                bairro: {
                    connectOrCreate: {
                        where: { nome: data.bairro },
                        create: {
                            nome: data.bairro,
                            lat: 0, 
                            lon: 0
                        }
                    }
                },

                // Salva Lat/Lon
                lat: data.localizacao ? data.localizacao[0] : null,
                lon: data.localizacao ? data.localizacao[1] : null,
                
                // Conecta ONG
                ong: {
                    connect: { id: data.ongId }
                }
            },
            include: {
                bairro: true,
                ong: true
            }
        });
    }

    // PERFIL DA ONG: Mostra tudo, ordenando futuros primeiro, passados por último
    async findAllByOng(ongId: string) {
        const acoes = await db.acao.findMany({
            where: { ongId },
            include: { ong: true, bairro: true }
        });

        const now = new Date().getTime();

        return acoes.sort((a, b) => {
            const timeA = this.getDateFromAcao(a);
            const timeB = this.getDateFromAcao(b);
            
            const isPastA = timeA < now;
            const isPastB = timeB < now;

            // Se um é passado e o outro futuro, o passado vai para o fim
            if (isPastA && !isPastB) return 1; 
            if (!isPastA && isPastB) return -1;
            
            // Se ambos são do mesmo grupo, ordena por data (mais próximo primeiro)
            return timeA - timeB;
        });
    }

    // HOME: Mostra APENAS eventos futuros
    async findAll(filters?: { category?: string[], target?: string[], search?: string }) {
        
        const whereClause: any = {};

        // Filtro de Busca Textual
        if (filters?.search) {
            whereClause.OR = [
                { nome: { contains: filters.search } },
                { descricao: { contains: filters.search } },
                { ong: { nome: { contains: filters.search } } }
            ];
        }

        // Filtros de Categoria
        if (filters?.category && filters.category.length > 0) {
            whereClause.ong = {
                ...whereClause.ong,
                ongNecessidade: {
                    some: { necessidade: { tipo: { in: filters.category } } }
                }
            };
        }

        // Filtros de Público
        if (filters?.target && filters.target.length > 0) {
            whereClause.ong = {
                ...whereClause.ong,
                ongPublicoAlvo: {
                    some: { publicoAlvo: { tipo: { in: filters.target } } }
                }
            };
        }

        const acoes = await db.acao.findMany({
            where: whereClause,
            include: {
                bairro: true,
                ong: {
                    include: {
                        ongNecessidade: { include: { necessidade: true } },
                        ongPublicoAlvo: { include: { publicoAlvo: true } }
                    }
                }
            }
        });

        const now = new Date().getTime();

        // 1. FILTRA: Remove eventos passados da Home
        const eventosFuturos = acoes.filter(acao => {
            return this.getDateFromAcao(acao) >= now;
        });

        // 2. ORDENA: Próximos primeiro
        return eventosFuturos.sort((a, b) => {
            return this.getDateFromAcao(a) - this.getDateFromAcao(b);
        });
    }

    async findById(id: string) {
        return db.acao.findFirst({
            where: { id },
            include: { 
                ong: true,
                bairro: true 
            }
        });
    }

    async update(id: string, data: any) {
        // Remove 'data' se vier no update também
        const { data: _, ...updateData } = data;
        
        return db.acao.update({
            where: { id },
            data: updateData,
            include: { ong: true }
        });
    }

    async delete(id: string) {
        return db.acao.delete({
            where: { id }
        });
    }
}

export default new ONGAcaoRepository();
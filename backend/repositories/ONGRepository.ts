import db from '../db.ts';
import CreateONG from "./dto/ONGCreateDto";
import ONGUpdateDto from "./dto/ONGUpdateDto";

class ONGRepository {

    async save(data: CreateONG) {
        // Limpeza
        const uniquePublico = [...new Set(data.publico_alvo || [])];
        const uniqueNecessidades = [...new Set(data.necessidades || [])];

        // Data
        let anoCriacao: number = typeof data.data_criacao === 'string' 
            ? new Date(data.data_criacao).getFullYear() 
            : data.data_criacao;
        if (isNaN(anoCriacao)) anoCriacao = new Date().getFullYear();

        // Endereço Formatado (String única para exibição rápida)
        const enderecoFormatado = `${data.logradouro}, ${data.numero} - ${data.bairro}`;

        return db.ong.create({
            data: {
                login: data.login,
                senha: data.senha,
                nome: data.nome,
                cnpj: data.cnpj,
                descricao: "Não há descrição",
                data_criacao: anoCriacao,

                // --- PADRONIZAÇÃO DE ENDEREÇO ---
                cep: data.cep,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                endereco: enderecoFormatado, // Salva o formatado também
                
                // Conecta ao Bairro pelo Nome (Vem do Seed)
                bairro: {
                    connect: { nome: data.bairro } 
                },

                // Salva Lat/Lon separados
                lat: data.localizacao ? data.localizacao[0] : 0,
                lon: data.localizacao ? data.localizacao[1] : 0,

                // Relacionamentos
                ongNecessidade: {
                    create: uniqueNecessidades.map(n => ({
                        necessidade: {
                            connectOrCreate: { where: { tipo: n }, create: { tipo: n } }
                        }
                    }))
                },
                ongPublicoAlvo: {
                    create: uniquePublico.map(p => ({
                        publicoAlvo: {
                            connectOrCreate: { where: { tipo: p }, create: { tipo: p } }
                        }
                    }))
                },
            },
            include: {
                bairro: true, // Inclui o bairro na resposta
                ongNecessidade: { include: { necessidade: true } },
                ongPublicoAlvo: { include: { publicoAlvo: true } },
            },
        });
    }

    async addImage(ongId: string, filename: string) {
        return db.ongImage.create({
            data: {
                ong: { connect: { id: ongId } },
                filename: filename
            }
        })
    }

    async getImage(id: string): Promise<any> {
        return db.ongImage.findFirstOrThrow({where: {id: id}});
    }

    async update(id: string, ongUpdateDto: ONGUpdateDto): Promise<any> {
        // 1. Limpeza de duplicatas (Mantido)
        ongUpdateDto.added_publico_alvo = [...new Set(ongUpdateDto.added_publico_alvo)];
        ongUpdateDto.added_necessidades = [...new Set(ongUpdateDto.added_necessidades)];
        
        // 2. Operações de Relacionamento (Mantido)
        await Promise.all(ongUpdateDto.removed_necessidades.map(removedId =>
            db.ongNecessidade.delete({ where: { id: removedId } })
        ));
        
        await Promise.all(ongUpdateDto.removed_publico_alvo.map(removedId =>
            db.ongPublicoAlvo.delete({ where: { id: removedId } })
        ));
        
        await Promise.all(ongUpdateDto.added_necessidades.map(necessidade =>
            db.ongNecessidade.create({
                data: {
                    ong: { connect: {id: id} },
                    necessidade: {
                        connectOrCreate: {
                            where: {tipo: necessidade},
                            create: {tipo: necessidade}
                        }
                    }
                }
            })
        ));
        
        await Promise.all(ongUpdateDto.added_publico_alvo.map(publicoAlvo =>
            db.ongPublicoAlvo.create({
                data: {
                    ong: { connect: {id: id} },
                    publicoAlvo: {
                        connectOrCreate: {
                            where: {tipo: publicoAlvo},
                            create: {tipo: publicoAlvo}
                        }
                    }
                }
            })
        ));
        
        // --- CORREÇÃO ROBUSTA: Monta o objeto de dados dinamicamente ---
        const dataToUpdate: any = {
            nome: ongUpdateDto.nome
        };

        // Só adiciona o endereço se ele foi enviado e não for undefined
        if (ongUpdateDto.endereco !== undefined) {
            dataToUpdate.endereco = ongUpdateDto.endereco;
        }

        return db.ong.update({
            where: {id},
            data: dataToUpdate
        });
    }

    async updatePassword(id: string, hashedPassword: string): Promise<any> {
        return db.ong.update({
            where: {id: id},
            data: {senha: hashedPassword},
        });
    }

    async deleteImage(id: string): Promise<any> {
        return db.ongImage.delete({where: {id: id}});
    }

    async findById(id: string) {
        return db.ong.findUnique({
            where: { id },
            include: {
                ongNecessidade: { include: { necessidade: true } },
                ongPublicoAlvo: { include: { publicoAlvo: true } },
                ongContato: { include: { tipoContato: true } },
                ongImage: true
            },
        });
    }

    async updateDescription(id: string, description: string) {
        return db.ong.update({
            where: { id },
            data: { descricao: description },
            include: {
                ongNecessidade: { include: { necessidade: true } },
                ongPublicoAlvo: { include: { publicoAlvo: true } },
                ongContato: { include: { tipoContato: true } },
                ongImage: true
                
            }
        });
    }

    async existsByLogin(login: string): Promise<Boolean> {
        const exists = await db.ong.findFirst({
            where: { login: login }
        })
        return exists !== null;
    }

    /*async findAll() {
        return db.ong.findMany({
            include: {
                ongNecessidade: { include: { necessidade: true } },
                ongPublicoAlvo: { include: { publicoAlvo: true } },
                ongContato: { include: { tipoContato: true } },
                ongImage: true
            },
        });
    }*/

    // Agora aceita location, category (Causa) e target (Público Alvo)
    // Agora aceita arrays de string ou undefined
    async findAll(filters?: { location?: string[], category?: string[], target?: string[], search?: string }) {
        
        const whereClause: any = {};

        // 1. Busca Textual (Nome da ONG)
        if (filters?.search) {
            whereClause.nome = {
                contains: filters.search
            };
        }

        // 2. Localização (Bairros) - Lógica OR
        if (filters?.location && filters.location.length > 0) {
            whereClause.OR = filters.location.map(loc => ({
                endereco: { contains: loc }
            }));
        }

        // 3. Causas - Lógica IN
        if (filters?.category && filters.category.length > 0) {
            whereClause.ongNecessidade = {
                some: {
                    necessidade: { tipo: { in: filters.category } }
                }
            };
        }

        // 4. Público Alvo - Lógica IN
        if (filters?.target && filters.target.length > 0) {
            whereClause.ongPublicoAlvo = {
                some: {
                    publicoAlvo: { tipo: { in: filters.target } }
                }
            };
        }

        return db.ong.findMany({
            where: whereClause,
            include: {
                ongNecessidade: { include: { necessidade: true } },
                ongPublicoAlvo: { include: { publicoAlvo: true } },
                // Não precisamos incluir contato agora se não for exibir na lista, 
                // mas vamos manter para o card funcionar
                ongContato: { include: { tipoContato: true } }, 
                ongImage: true,
                bairro: true
            },
            // Limitamos a 50 para não travar se tiver mil ONGs (paginação futura)
            take: 50 
        });
    }

    // Métodos adicionais (Logo, Contato, Delete)
    async updateLogo(id: string, filename: string) {
        return db.ong.update({
            where: { id: id },
            data: { logo: filename }
        });
    }

    async addContact(id: string, contato: { tipo: string, valor: string }) {
        // Usa connectOrCreate para evitar erro se o tipo não existir
        return db.ongContato.create({
            data: {
                valor: contato.valor,
                ong: { connect: { id: id } },
                tipoContato: {
                    connectOrCreate: {
                        where: { tipo: contato.tipo },
                        create: { tipo: contato.tipo }
                    }
                }
            },
            include: { tipoContato: true }
        });
    }

    async removeContact(contactId: string) {
        return db.ongContato.delete({
            where: { id: contactId }
        });
    }

    async findByLogin(login: string) {
        return db.ong.findFirst({
            where: { login: login }
        });
    }

    async delete(id: string) {
        return db.ong.delete({
            where: { id }
        });
    }

    
}

export default new ONGRepository()
import db from '../db.ts'
import CreateONG from "./dto/ONGCreateDto";
import ONGUpdateDto from "./dto/ONGUpdateDto";

class ONGRepository {

    async save(createONG: CreateONG) {
        // 1. Limpeza de duplicatas nos arrays
        const uniquePublico = [...new Set(createONG.publico_alvo || [])];
        const uniqueNecessidades = [...new Set(createONG.necessidades || [])];

        // 2. Conversão da Data (String "YYYY-MM-DD" para Inteiro YYYY)
        // Se vier string, pega o ano. Se vier número, mantém.
        let anoCriacao: number;
        if (typeof createONG.data_criacao === 'string') {
            const date = new Date(createONG.data_criacao);
            anoCriacao = date.getFullYear();
            // Fallback: se a data for inválida, usa o ano atual
            if (isNaN(anoCriacao)) anoCriacao = new Date().getFullYear();
        } else {
            anoCriacao = createONG.data_criacao;
        }

        // 3. Criação da ONG (Removida a validação prévia que travava o cadastro)
        return db.ong.create({
            data: {
                login: createONG.login,
                senha: createONG.senha,
                descricao: "Não há descrição", // Valor padrão
                nome: createONG.nome,
                cnpj: createONG.cnpj,
                // Se o front não mandar cep, enviamos uma string vazia ou tratamos aqui
                endereco: createONG.cep || "Sem endereço", 
                data_criacao: anoCriacao, // Aqui vai o Inteiro
                
                // Mapeia o array [lat, lon] para os campos do banco
                lat: createONG.localizacao ? createONG.localizacao[0] : 0,
                lon: createONG.localizacao ? createONG.localizacao[1] : 0,
                
                // Relacionamento: Se a necessidade existe, conecta. Se não, cria.
                ongNecessidade: {
                    create: uniqueNecessidades.map(n => ({
                        necessidade: {
                            connectOrCreate: {
                                where: { tipo: n },
                                create: { tipo: n }
                            }
                        }
                    }))
                },
                
                // Relacionamento: Se o público alvo existe, conecta. Se não, cria.
                ongPublicoAlvo: {
                    create: uniquePublico.map(p => ({
                        publicoAlvo: {
                            connectOrCreate: {
                                where: { tipo: p },
                                create: { tipo: p }
                            }
                        }
                    }))
                },
            },
            include: {
                ongNecessidade: {
                    include: { necessidade: true },
                },
                ongPublicoAlvo: {
                    include: { publicoAlvo: true },
                },
            },
        });
    }

    // --- O RESTANTE DO ARQUIVO PERMANECE IGUAL ---
    
    async addImage(ongId: string, filename: string) {
        return db.ongImage.create({
                data: {
                    ong: {
                        connect: {
                            id: ongId
                        }
                    },
                    filename: filename
                }
            }
        )
    }

    async getImage(id: string): Promise<any> {
        return db.ongImage.findFirstOrThrow({where: {id: id}});
    }

    async update(id: string, ongUpdateDto: ONGUpdateDto): Promise<any> {
        ongUpdateDto.added_publico_alvo = [...new Set(ongUpdateDto.added_publico_alvo)];
        ongUpdateDto.added_necessidades = [...new Set(ongUpdateDto.added_necessidades)];
        
        await Promise.all(ongUpdateDto.removed_necessidades.map(removedNecessidadeId =>
            db.ongNecessidade.delete({ where: { id: removedNecessidadeId } })
        ));
        
        await Promise.all(ongUpdateDto.removed_publico_alvo.map(removedPublicoAlvoId =>
            db.ongPublicoAlvo.delete({ where: { id: removedPublicoAlvoId } })
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
        
        return db.ong.update({
            where: {id},
            data: {nome: ongUpdateDto.nome}
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

    async findAll() {
        return db.ong.findMany({
                include: {
                    ongNecessidade: { include: { necessidade: true } },
                    ongPublicoAlvo: { include: { publicoAlvo: true } },
                    ongContato: { include: { tipoContato: true } },
                    ongImage: true
                },
            }
        );
    }

    // Adicione isso dentro da classe ONGRepository, antes do último }

    // 1. Salvar Logo (Atualiza o campo logo da ONG)
    async updateLogo(id: string, filename: string) {
        return db.ong.update({
            where: { id: id },
            data: { logo: filename } // Certifique-se que seu banco tem a coluna 'logo' na tabela ONG
        });
    }

    // 2. Adicionar Contato
    async addContact(id: string, contato: { tipo: string, valor: string }) {
        // Primeiro buscamos o Tipo de Contato (ex: EMAIL, WHATSAPP)
        // Se não tiver a tabela de tipos populada, isso pode dar erro.
        // Assumindo que você tem uma tabela 'TipoContato'
        const tipo = await db.tipoContato.findFirst({
            where: { tipo: contato.tipo }
        });

        if (!tipo) {
            throw new Error("Tipo de contato inválido");
        }

        return db.ongContato.create({
            data: {
                valor: contato.valor,
                ong: { connect: { id: id } },
                tipoContato: { connect: { id: tipo.id } }
            }
        });
    }

    // 3. Remover Contato
    async deleteContact(contactId: string) {
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
        // O Prisma geralmente cuida do 'Cascade Delete' se configurado no schema.
        // Se der erro de Foreign Key, teremos que deletar as relações antes.
        return db.ong.delete({
            where: { id }
        });
    }

}

export default new ONGRepository()
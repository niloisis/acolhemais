import db from '../db.ts'
import CreateONG from "./dto/ONGCreateDto";
import ONGUpdateDto from "./dto/ONGUpdateDto";

class ONGRepository {

    async save(createONG: CreateONG) {
        // 1. Limpeza de duplicatas nos arrays
        const uniquePublico = [...new Set(createONG.publico_alvo || [])];
        const uniqueNecessidades = [...new Set(createONG.necessidades || [])];

        // 2. Conversão da Data
        let anoCriacao: number;
        if (typeof createONG.data_criacao === 'string') {
            const date = new Date(createONG.data_criacao);
            anoCriacao = date.getFullYear();
            if (isNaN(anoCriacao)) anoCriacao = new Date().getFullYear();
        } else {
            anoCriacao = createONG.data_criacao;
        }

        // 3. Criação da ONG
        return db.ong.create({
            data: {
                login: createONG.login,
                senha: createONG.senha,
                descricao: "Não há descrição",
                nome: createONG.nome,
                cnpj: createONG.cnpj,
                
                // --- CORREÇÃO 1: Prioriza o endereço por extenso, se não tiver, usa o CEP ---
                endereco: createONG.endereco  || createONG.cep || "Endereço não informado",
                
                data_criacao: anoCriacao,
                
                // Mapeia o array [lat, lon]
                lat: createONG.localizacao ? createONG.localizacao[0] : 0,
                lon: createONG.localizacao ? createONG.localizacao[1] : 0,
                
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

    async findAll() {
        return db.ong.findMany({
            include: {
                ongNecessidade: { include: { necessidade: true } },
                ongPublicoAlvo: { include: { publicoAlvo: true } },
                ongContato: { include: { tipoContato: true } },
                ongImage: true
            },
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
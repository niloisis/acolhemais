import db from '../db.ts'
import CreateONG from "./dto/ONGCreateDto";
import ONGUpdateDto from "./dto/ONGUpdateDto";

class ONGRepository {

    async save(createONG: CreateONG) {
        createONG.publico_alvo = [...new Set(createONG.publico_alvo)];
        createONG.necessidades = [...new Set(createONG.necessidades)];
        await Promise.all([
            Promise.all(
                createONG.necessidades.map(n =>
                    db.necessidade.findFirstOrThrow({
                        where: {tipo: n}
                    })
                )
            ),
            Promise.all(
                createONG.publico_alvo.map(pa =>
                    db.publicoAlvo.findFirstOrThrow({
                        where: {tipo: pa}
                    })
                )
            )
        ]);
        return db.ong.create({
            data: {
                login: createONG.login,
                senha: createONG.senha,
                descricao: "Não há descrição",
                nome: createONG.nome,
                cnpj: createONG.cnpj,
                endereco: createONG.endereco,
                data_criacao: createONG.data_criacao,
                lat: createONG.localizacao[0],
                lon: createONG.localizacao[1],
                ongNecessidade: {
                    create: createONG.necessidades.map(n => ({
                        necessidade: {
                            connectOrCreate: {
                                where: {
                                    tipo: n
                                }
                                ,
                                create: {
                                    tipo: n
                                }
                            }
                        },
                    }))
                },
                ongPublicoAlvo: {
                    create: createONG.publico_alvo.map(p => ({
                        publicoAlvo: {
                            connectOrCreate: {
                                where: {
                                    tipo: p
                                },
                                create: {
                                    tipo: p
                                }
                            }
                        }
                    }))
                },
            },
            include: {
                ongNecessidade: {
                    include: {
                        necessidade: true
                    },
                },
                ongPublicoAlvo: {
                    include: {
                        publicoAlvo: true
                    },
                },
            },
        });
    }

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

    async getImage(id: string): any {
        return db.ongImage.findFirstOrThrow({where: {id: id}});
    }

    async update(id: string, ongUpdateDto: ONGUpdateDto): Promise<any> {
        ongUpdateDto.added_publico_alvo = [...new Set(ongUpdateDto.added_publico_alvo)];
        ongUpdateDto.added_necessidades = [...new Set(ongUpdateDto.added_necessidades)];
        await Promise.all(ongUpdateDto.removed_necessidades.map(removedNecessidadeId =>
            db.ongNecessidade.delete(
                {
                    where: {
                        id: removedNecessidadeId
                    }
                })
        ));
        await Promise.all(ongUpdateDto.removed_publico_alvo.map(removedPublicoAlvoId =>
            db.ongPublicoAlvo.delete(
                {
                    where: {
                        id: removedPublicoAlvoId
                    }
                })
        ));
        await Promise.all(ongUpdateDto.added_necessidades.map(necessidade =>
            db.ongNecessidade.create({
                data: {
                    ong: {
                        connect: {id: id},
                    },
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
                    ong: {
                        connect: {id: id},
                    },
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

    async updatePassword(id: string, hashedPassword: string): any {
        return db.ong.update({
            where: {id: id},
            data: {senha: hashedPassword},
        });
    }

    async deleteImage(id: string): any {
        return db.ongImage.delete({where: {id: id}});
    }

    async findById(id: string) {
        return db.ong.findUnique({
            where: {
                id
            },
            include: {
                ongNecessidade: {
                    include: {
                        necessidade: true
                    }
                },
                ongPublicoAlvo: {
                    include: {
                        publicoAlvo: true
                    }
                },
                ongContato: {
                    include: {
                        tipoContato: true
                    },
                },
                ongImage: true
            },
        });
    }

    async updateDescription(id: string, description: string) {
        return db.ong.update({
            where: {
                id
            },
            data: {
                descricao: description
            },
            include: {
                ongNecessidade: {
                    include: {
                        necessidade: true
                    }
                },
                ongPublicoAlvo: {
                    include: {
                        publicoAlvo: true
                    }
                },
                ongContato: {
                    include: {
                        tipoContato: true
                    }
                },
                ongImage: true
            }
        });
    }


    async existsByLogin(login: string): Promise<Boolean> {
        const exists = await db.ong.findFirst({
            where: {
                login: login
            }
        })
        return exists !== null;
    }

    async findAll() {
        return db.ong.findMany({
                include: {
                    ongNecessidade: {
                        include: {
                            necessidade: true
                        }
                    },
                    ongPublicoAlvo: {
                        include: {
                            publicoAlvo: true
                        }
                    },
                    ongContato: {
                        include: {
                            tipoContato: true
                        },
                    },
                    ongImage: true
                },
            }
        );
    }

    async findByLogin(login: string) {
        return db.ong.findFirst({
            where: {
                login: login
            }
        });
    }
}

export default new ONGRepository() 



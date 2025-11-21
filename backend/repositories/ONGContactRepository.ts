import db from '../db.ts'

// Removemos o 'id' do type de entrada, pois quem cria o ID é o banco
type AddContactData = {
    tipo: "EMAIL" | "INSTAGRAM" | "WHATSAPP" | "TELEFONE" | "SITE",
    valor: string,
}

class ONGContactRepository {

    async addContact(ongId: string, data: AddContactData) {
        // A MÁGICA ACONTECE AQUI: connectOrCreate
        // Isso evita o erro se a tabela TipoContato estiver vazia
        return db.ongContato.create({
            data: {
                valor: data.valor,
                ong: {
                    connect: {
                        id: ongId,
                    }
                },
                tipoContato: {
                    connectOrCreate: {
                        where: { tipo: data.tipo },
                        create: { tipo: data.tipo }
                    }
                },
            },
            include: {
                tipoContato: true
            },
        });
    }

    async removeContact(id: string) {
        await db.ongContato.delete({
            where: {id}
        });
    }

}

export default new ONGContactRepository()
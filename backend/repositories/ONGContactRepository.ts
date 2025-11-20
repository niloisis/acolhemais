import db from '../db.ts'

type AddContact = {
    id: string,
    tipo: "EMAIL" | "INSTAGRAM" | "WHATSAPP" | "TELEFONE" | "SITE",
    valor: string,
}

class ONGContactRepository {

    async addContact(ongId: string, addContact: AddContact) {
        let tipoContato = await db.tipoContato.findUnique({
            where: {tipo: addContact.tipo}
        });
        if (!tipoContato) {
            throw new Error("Esse tipo de contato não existe")
        }
        return db.ongContato.create({
            data: {
                tipoContato: {
                    connect: {
                        tipo: addContact.tipo
                    }
                },
                ong: {
                    connect: {
                        id: ongId,
                    }
                },
                valor: addContact.valor,
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



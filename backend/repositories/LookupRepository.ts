import db from '../db';

class LookupRepository {
    async findAllNecessidades() {
        return db.necessidade.findMany({ orderBy: { tipo: 'asc' } });
    }

    async findAllPublicoAlvo() {
        return db.publicoAlvo.findMany({ orderBy: { tipo: 'asc' } });
    }
}

export default new LookupRepository();
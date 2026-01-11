import db from '../db';

class LookupRepository {
    
    // Busca todas as Necessidades (Causas)
    async findAllNecessidades() {
        return db.necessidade.findMany({ 
            orderBy: { tipo: 'asc' } 
        });
    }

    // Busca todos os Públicos Alvo
    async findAllPublicoAlvo() {
        return db.publicoAlvo.findMany({ 
            orderBy: { tipo: 'asc' } 
        });
    }

    // Busca todos os Bairros
    async findAllBairros() {
        return db.bairro.findMany({ 
            orderBy: { nome: 'asc' } 
        });
    }
    
    // Método auxiliar para o sistema de recomendação (que usamos antes)
    async findBairrosByNames(names: string[]) {
        return db.bairro.findMany({
            where: {
                nome: { in: names }
            }
        });
    }
}

export default new LookupRepository();
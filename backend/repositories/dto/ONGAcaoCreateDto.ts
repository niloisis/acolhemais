type ONGAcaoCreateRequest = {
    ongId: string; // Corrigido de 'ondId'
    nome: string;
    
    // Data/Hora
    dia: number;
    mes: string;
    ano: number;
    inicio: string;
    termino: string;
    
    // Endereço Detalhado (Igual ONG)
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string; // Nome do bairro
    complemento?: string;
    
    // Coordenadas (Igual ONG)
    localizacao?: number[]; // Opcional, caso a ação seja em outro lugar
    
    descricao?: string;
    como_participar?: string;
    link_contato?: string;
};

export default ONGAcaoCreateRequest;
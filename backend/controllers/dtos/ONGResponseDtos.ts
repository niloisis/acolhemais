export type Coordinates = { latitude: number, longitude: number };
export type Necessidades = { id: string, tipo: string };
export type PublicoAlvo = { id: string, tipo: string };

export type Contact = {
    id: string;
    tipo: "EMAIL" | "TELEFONE" | "WHATSAPP" | "INSTAGRAM" | "SITE";
    valor: string;
}

export type ONGCompleteResponse = {
    id: string;
    login: string;
    nome: string;
    descricao: string;
    cnpj?: string;
    data_criacao: number;
    
    // Endereço Formatado (String única)
    endereco: string;
    
    // Campos Detalhados (Novos)
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string; // Nome do bairro
    complemento?: string;
    
    // Geo
    localizacao: Coordinates;
    
    // Listas
    necessidades: Necessidades[];
    publico_alvo: PublicoAlvo[];
    contatos: Contact[];
    images: string[];
}

export type AcaoResponse = {
    id?: string;
    ongId: string;
    nome: string;
    
    // Data/Hora
    dia: number;
    mes: string;
    ano: number;
    inicio: string;
    termino: string;
    
    // Endereço Formatado
    endereco: string;

    // Campos Detalhados
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    complemento?: string;
    
    // Geo (Novo para Ação)
    localizacao?: Coordinates;

    descricao: string;
    como_participar: string;
    link_contato: string;
}
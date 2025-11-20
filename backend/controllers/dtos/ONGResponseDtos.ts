export type ONGCompleteResponse = {
    id: string;
    login: string;
    nome: string;
    descricao: string;
    cnpj?: string;
    data_criacao: number;
    localizacao: Coordinates;
    endereco: string;
    necessidades: Necessidades[];
    publico_alvo: PublicoAlvo[];
    contatos: Contact[]
}
export type AcaoResponse = {
    id?: string;
    nome: string;
    dia: number;
    mes: string;
    ano: number;
    inicio: string;
    termino: string;
    cep: string;
    ongId: string;
    bairro: string;
    endereco: string;
    numero: string;
    complemento?: string;
    descricao: string,
    como_participar: string,
    link_contato: string,
}
export type Coordinates = { latitude: number, longitude: number };
export type Necessidades = { id: string, tipo: string };
export type PublicoAlvo = { id: string, tipo: string };

export type Contact = {
    id: string;
    tipo: "EMAIL" | "TELEFONE";
    valor: string;
}
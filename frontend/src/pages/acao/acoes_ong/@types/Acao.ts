export type Acao = {
    id: string;
    nome: string;
    dia: number;
    mes: string;
    ano: number;
    inicio: string;
    termino: string;
    cep: string;
    bairro: string;
    endereco: string;
    numero: string;
    complemento?: string;
    descricao: string,
    como_participar: string,
    ongId: string,
    link_contato?: string,
}
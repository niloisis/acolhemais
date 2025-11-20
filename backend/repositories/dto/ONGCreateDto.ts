type CreateONG = {
    login: string;
    senha: string;
    nome: string;
    cnpj: string;
    data_criacao: number;
    localizacao: number[];
    endereco: number[];
    publico_alvo: string[],
    necessidades: string[],
}

export default CreateONG;
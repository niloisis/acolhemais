type CreateONG = {
    login: string;
    senha: string;
    nome: string;
    cnpj: string;
    data_criacao: string | number; 
    localizacao: number[]; // [latitude, longitude]
    endereco: string; 
    cep?: string; 
    publico_alvo: string[];
    necessidades: string[];
}

export default CreateONG;
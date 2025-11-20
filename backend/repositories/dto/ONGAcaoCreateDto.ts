type ONGAcaoCreateRequest = {
    ondId: string;
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
};

export default ONGAcaoCreateRequest;

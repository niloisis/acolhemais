type CreateONG = {
    login: string;
    senha: string;
    nome: string;
    cnpj: string;
    data_criacao: string | number;
    
    // Endereço Detalhado
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string; // Recebe o NOME do bairro (ex: "Várzea")
    complemento?: string;
    
    // Coordenadas
    localizacao: number[]; // [latitude, longitude]
    
    // Listas
    publico_alvo: string[];
    necessidades: string[];
    
    // Campo legado (opcional, pois montaremos no back)
    endereco?: string; 
}

export default CreateONG;
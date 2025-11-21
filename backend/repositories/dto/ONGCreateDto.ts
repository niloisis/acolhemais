type CreateONG = {
    login: string;
    senha: string;
    nome: string;
    cnpj: string;
    
    // CORREÇÃO 1: Aceita string (do input date) ou number (legado)
    data_criacao: string | number; 
    
    localizacao: number[]; // [latitude, longitude]
    
    // CORREÇÃO 2: Endereço é texto, não array de números
    endereco?: string; 
    
    // ADIÇÃO: O Front manda 'cep', então precisamos aceitar aqui para o Repository ler
    cep?: string; 

    publico_alvo: string[];
    necessidades: string[];
}

export default CreateONG;
export type Ong = {
    id: string;
    login: string;
    nome: string;
    senha: string; // O backend (corretamente) não envia a senha para o front
    descricao: string;
    cnpj?: string;
    data_criacao: number | string; // Pode vir como string dependendo da serialização, seguro aceitar ambos
    
    // --- ENDEREÇO (Novos Campos) ---
    endereco: string;      // String formatada (Ex: "Rua A, 123 - Centro")
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;        // Nome do bairro
    complemento?: string;

    // --- GEOLOCALIZAÇÃO (Agora é um objeto) ---
    localizacao: {
        latitude: number;
        longitude: number;
    };

    // --- RELACIONAMENTOS ---
    necessidades: {
        id: string;
        tipo: string;
    }[];
    
    publico_alvo: {
        id: string;
        tipo: string;
    }[];
    
    contatos: {
        id: string;
        tipo: string;
        valor: string;
    }[];
    
    images: string[]; // Lista de IDs das imagens
};
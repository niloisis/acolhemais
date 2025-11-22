type UpdateONG = {
    nome: string;
    endereco?: string; // <--- ADICIONE ESSA LINHA
    removed_necessidades: string[];
    added_necessidades: string[];
    added_publico_alvo: string[];
    removed_publico_alvo: string[];
}

export default UpdateONG;
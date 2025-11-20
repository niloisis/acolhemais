import {Coordinates} from "@/components/ui/map/map.tsx";

export type Necessidade = {
    id: string;
    tipo: string;
};

export type Contatos = {
    id: string;
    tipo: "EMAIL" | "INSTAGRAM" | "WHATSAPP" | "TELEFONE" | "SITE",
    valor: string
};

export type PublicoAlvo = {
    id: string;
    tipo: string;
};

export type Ong = {
    id: string;
    login: string;
    nome: string;
    senha: string;
    descricao: string;
    cnpj: string;
    data_criacao: number;
    localizacao: Coordinates;
    endereco: string;
    necessidades: Necessidade[];
    images: string[];
    publico_alvo: PublicoAlvo[];
    contatos: Contatos[];
};


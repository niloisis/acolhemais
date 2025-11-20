export interface Ong {
  id: string;
  nome: string;
  endereco: string;
  descricao: string;
  images: string[];
  publico_alvo?:Array<{ tipo: string }>;
  necessidades?: Array<{ tipo: string }>;
}

export interface Acao {
  id: string;
  nome: string;
  dia: string;
  mes: string;
  ano: string;
  inicio: string;
  termino: string;
  endereco: string;
  numero: string;
  bairro: string;
  // Adicionei o bannerUrl aqui para facilitar a lógica depois
  bannerUrl?: string; 
}
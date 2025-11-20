// src/types/acolhe.ts

export interface BaseItem {
  id: string;
  imageUrl: string;
  location: string; // Ex: "Santo Amaro, PE"
  tags: string[];   // Ex: ["Crianças", "Educação"]
}

export interface Ong extends BaseItem {
  type: 'ong';
  name: string;     // Ex: "ONG Saluz"
}

export interface Event extends BaseItem {
  type: 'event';
  title: string;    // Ex: "Colônia de Férias"
  ongName: string;  // Quem está organizando
  date: string;     // Ex: "17 de janeiro"
}

// Um tipo que pode ser um ou outro (útil para listas mistas se precisar)
export type FeedItem = Ong | Event;
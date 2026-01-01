// src/constants/championships.ts

export type ChampionshipType =
  | "Municipal"
  | "Estadual"
  | "Nacional"
  | "Internacional";

export interface ChampionshipOption {
  id: string;
  name: string;
  type: ChampionshipType | null;
}

/**
 * Campeonatos padronizados
 * ⚠️ Lista fixa por enquanto
 */
export const CHAMPIONSHIPS: ChampionshipOption[] = [
  {
    id: "cbs",
    name: "Campeonato Brasileiro de Seleções",
    type: "Nacional",
  },
  {
    id: "superliga",
    name: "Superliga Brasileira",
    type: "Nacional",
  },
  {
    id: "estadual",
    name: "Campeonato Estadual",
    type: "Estadual",
  },
  {
    id: "municipal",
    name: "Campeonato Municipal",
    type: "Municipal",
  },
  {
    id: "outro",
    name: "Outro",
    type: null,
  },
];

/**
 * Estados brasileiros (lista fixa)
 */
export const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO"
];

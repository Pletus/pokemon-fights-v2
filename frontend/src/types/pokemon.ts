// src/types/pokemon.ts

export interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
}

export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonSprites {
  front_default: string;
  [key: string]: string | undefined;
}

export interface PokemonSpecies {
  name: string;
}

export interface Pokemon {
  id: number;
  name: { english: string };
  species: PokemonSpecies;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  types: PokemonType[];
  sprites: PokemonSprites;
}

export interface PokemonListResponse {
  results: { name: string; url: string }[];
}

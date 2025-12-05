export interface PokemonStat {
  stat: { name: string };
  base_stat: number;
}

export interface PokemonAbility {
  ability: { name: string };
}

export interface PokemonListResponse {
  results: { name: string; url: string }[];
}

export interface PokemonType {
  type: { name: string };
}

export interface Pokemon {
  species: any;
  id: number;
  name: { english: string };
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: any[];
  types: { type: { name: string } }[];
  sprites: {
    front_default: string;
    [key: string]: string | undefined;
    
  };
}
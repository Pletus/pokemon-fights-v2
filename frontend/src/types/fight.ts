import { Pokemon } from "./pokemon";

// Cada entrada del log de batalla
export interface FightLogEntry {
  message: string;
  hpLeft: number;
}

// Resultado de un combate
export interface FightResult {
  pokemon1: string;
  pokemon2: string;
  winner: string; // "draw" si hay empate
  battleLog: string[]; // Array de mensajes de la batalla
}

// Estado de los Pokémon seleccionados para pelear
export interface SelectedPokemons {
  left: Pokemon | null;
  right: Pokemon | null;
}

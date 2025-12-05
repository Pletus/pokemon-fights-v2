import React from "react";
import { useLocation } from "react-router-dom";
import { Pokemon } from "./types/pokemon";

const typeColors: Record<string, string> = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  psychic: "#F85888",
  normal: "#A8A878",
  fighting: "#C03028",
  flying: "#A890F0",
  poison: "#A040A0",
  ground: "#E0C068",
  rock: "#B8A038",
  bug: "#A8B820",
  ghost: "#705898",
  steel: "#B8B8D0",
  ice: "#98D8D8",
  dragon: "#7038F8",
  dark: "#705848",
  fairy: "#EE99AC",
};

const Card: React.FC = () => {
  const location = useLocation();
  const pokemon = location.state as Pokemon | undefined;

  const capitalize = (str?: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  if (!pokemon) return <div className="text-center mt-8">Pokémon not found.</div>;

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-2xl shadow-lg overflow-hidden p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold text-blue-700 mb-2">{capitalize(pokemon?.name?.english)}</h2>

      <img
        src={pokemon?.sprites?.front_default}
        alt={pokemon?.name?.english}
        className="w-40 h-40 sm:w-48 sm:h-48 object-contain mb-3"
      />

      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {pokemon?.types?.map((typeInfo) => (
          <span
            key={typeInfo.type.name}
            className="text-white text-sm px-4 py-1 rounded-full font-semibold"
            style={{ backgroundColor: typeColors[typeInfo.type.name] || "#A8A878" }}
          >
            {capitalize(typeInfo.type.name)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Card;


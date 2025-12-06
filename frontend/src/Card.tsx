// src/components/Card.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  abilities: { ability: { name: string } }[];
  types: { type: { name: string } }[];
  sprites: { front_default: string };
  stats: { base_stat: number; stat: { name: string } }[];
  species: { name: string };
};

const typeColors: Record<string, string> = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ground: "#E0C068",
  rock: "#B8A038",
  bug: "#A8B820",
  poison: "#A040A0",
  psychic: "#F85888",
  dragon: "#7038F8",
  ice: "#98D8D8",
  fighting: "#C03028",
  normal: "#A8A878",
  fairy: "#EE99AC",
};

const Card: React.FC = () => {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get<PokemonDetail>(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((res) => setPokemon(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const capitalize = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  if (!pokemon) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 mb-8 bg-red-600 rounded-3xl shadow-2xl p-6 border-4 border-black">
      {/* HEADER */}
      <div className="bg-black rounded-xl p-3 mb-4 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Pokédex #{pokemon.id}</h1>
        <div className="flex gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-black"></div>
          <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-black"></div>
          <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-black"></div>
        </div>
      </div>

      {/* IMAGE */}
      <div className="bg-gray-200 rounded-xl p-4 border-4 border-black shadow-inner flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">{capitalize(pokemon.name)}</h2>
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-40 h-40 object-contain mb-3"
        />

        {/* TYPES */}
        <div className="flex gap-2 justify-center mt-2">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="px-3 py-1 rounded-full text-white font-semibold"
              style={{ backgroundColor: typeColors[t.type.name] || "#666" }}
            >
              {capitalize(t.type.name)}
            </span>
          ))}
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-2 gap-4 mt-4 w-full text-center">
          <div className="bg-white p-2 rounded-lg shadow">
            <p className="font-bold text-sm">Height</p>
            <p>{pokemon.height / 10} m</p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow">
            <p className="font-bold text-sm">Weight</p>
            <p>{pokemon.weight / 10} kg</p>
          </div>
          <div className="bg-white p-2 rounded-lg shadow col-span-2">
            <p className="font-bold text-sm">Base XP</p>
            <p>{pokemon.base_experience}</p>
          </div>
        </div>

        {/* ABILITIES */}
        <h3 className="text-lg font-bold mt-5">Abilities</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {pokemon.abilities.map((a) => (
            <span
              key={a.ability.name}
              className="bg-gray-300 px-3 py-1 rounded-lg border border-gray-500"
            >
              {capitalize(a.ability.name)}
            </span>
          ))}
        </div>

        {/* STATS */}
        <h3 className="text-lg font-bold mt-6">Stats</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {pokemon.stats.map((s) => (
            <div key={s.stat.name} className="flex flex-col items-center">
              <div className="w-20 h-20">
                <CircularProgressbar
                  value={s.base_stat}
                  maxValue={150}
                  text={`${s.base_stat}`}
                  styles={buildStyles({
                    textSize: "18px",
                    pathColor: "#ff4444",
                    textColor: "#222",
                    trailColor: "#ddd",
                  })}
                />
              </div>
              <p className="text-sm mt-2">{capitalize(s.stat.name)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Card;

// src/components/Cards.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import pokemonLogo from "./assets/imgs/pokemon-23.svg";

type MinimalPokemon = {
  id: number;
  name: { english: string };
  types: { type: { name: string } }[];
  sprites: { front_default: string };
};

type PokemonAPIResponse = {
  results: { name: string; url: string }[];
};

type PokemonDetail = {
  name: string;
  types: { type: { name: string } }[];
  sprites: { front_default: string };
};

const Cards: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<MinimalPokemon[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<PokemonAPIResponse>("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then(async (response) => {
        const promises = response.data.results.map((p) =>
          axios.get<PokemonDetail>(p.url).then((res) => res.data)
        );
        const results = await Promise.all(promises);

        const formatted: MinimalPokemon[] = results.map(
          (pokemon: PokemonDetail, index) => ({
            id: index + 1,
            name: { english: pokemon.name },
            types: pokemon.types,
            sprites: pokemon.sprites,
          })
        );

        setPokemonList(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePrevSlide = () =>
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  const handleNextSlide = () =>
    setCurrentSlide((prev) =>
      Math.min(Math.ceil(pokemonList.length / 10) - 1, prev + 1)
    );

  const startIndex = currentSlide * 10;
  const endIndex = Math.min(startIndex + 10, pokemonList.length);

  const capitalize = (str: string) =>
    str?.charAt(0).toUpperCase() + str?.slice(1);

  const typeColors: Record<string, string> = {
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    normal: "#A8A878",
    // agrega más tipos si quieres
  };

  if (!pokemonList.length)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-xl font-semibold">Loading Pokémon...</span>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <img src={pokemonLogo} alt="pokemon" className="w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {pokemonList.slice(startIndex, endIndex).map((pokemon) => (
          <div
            key={pokemon.id}
            className="bg-white rounded-2xl shadow-lg cursor-pointer overflow-hidden flex flex-col items-center p-4"
            onClick={() =>
              navigate(`/pokemon/${pokemon.id}/details`, { state: pokemon })
            }
          >
            <h3 className="font-bold text-lg text-center text-blue-700 mb-2">
              {capitalize(pokemon.name.english)}
            </h3>
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name.english}
              className="w-32 h-32 sm:w-36 sm:h-36 object-contain mb-3"
            />
            <div className="flex gap-2 flex-wrap justify-center">
              {pokemon.types.map((typeInfo) => (
                <span
                  key={typeInfo.type.name}
                  className="text-white text-xs px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      typeColors[typeInfo.type.name] || "#A8A878",
                  }}
                >
                  {capitalize(typeInfo.type.name)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handlePrevSlide}
          className="bg-yellow-300 hover:bg-yellow-500 hover:text-white font-bold py-2 px-4 rounded-full transition"
        >
          Prev
        </button>
        <button
          onClick={handleNextSlide}
          className="bg-yellow-300 hover:bg-yellow-500 hover:text-white font-bold py-2 px-4 rounded-full transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Cards;

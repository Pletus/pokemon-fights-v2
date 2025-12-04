// src/components/Cards.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pokemon, PokemonListResponse } from "./types/pokemon"; // Ajusta la ruta si es necesario
import pokemonLogo from "./assets/imgs/pokemon-23.svg";

const Cards: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    axios
      .get<PokemonListResponse>("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then(async (response) => {
        const promises = response.data.results.map((p) =>
          axios.get<Pokemon>(p.url).then((res) => res.data)
        );

        const results = await Promise.all(promises);

        const formatted: Pokemon[] = results.map((pokemon: any, index: number) => ({
          id: index + 1,
          name: { english: pokemon.name },
          stats: pokemon.stats,
          abilities: pokemon.abilities,
          types: pokemon.types,
          sprites: pokemon.sprites,
        }));

        setPokemonList(formatted);
      })
      .catch((error) => console.error("Error fetching Pokémon data:", error));
  }, []);

  const handlePrevSlide = () => setCurrentSlide((prev) => Math.max(0, prev - 1));
  const handleNextSlide = () =>
    setCurrentSlide((prev) =>
      Math.min(Math.ceil(pokemonList.length / 10) - 1, prev + 1)
    );

  const startIndex = currentSlide * 10;
  const endIndex = Math.min(startIndex + 10, pokemonList.length);

  if (!pokemonList.length)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-xl font-semibold">Loading Pokémon...</span>
      </div>
    );

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="min-h-60 container mx-auto overflow-hidden pt-4 px-4">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={pokemonLogo} alt="pokemon" className="w-48" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {pokemonList.slice(startIndex, endIndex).map((pokemon) => (
          <div
            key={pokemon.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transform transition duration-300"
          >
            <div className="bg-yellow-400 p-2">
              <h3 className="text-center font-bold text-lg text-blue-700">
                {capitalize(pokemon.name.english)}
              </h3>
            </div>

            <div className="flex justify-center gap-4 mt-2">
              <div className="flex flex-col items-center">
                <div className="border-4 border-red-500 rounded-full h-10 w-10 flex items-center justify-center">
                  {pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat}
                </div>
                <span className="text-sm mt-1">Attack</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="border-4 border-green-500 rounded-full h-10 w-10 flex items-center justify-center">
                  {pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat}
                </div>
                <span className="text-sm mt-1">Defense</span>
              </div>
            </div>

            <div className="flex justify-center mt-3">
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name.english}
                className="w-32 h-32 md:w-40 md:h-40 object-contain"
              />
            </div>

            <div className="flex justify-center gap-2 flex-wrap mt-3 mb-3">
              {pokemon.types.map((typeInfo) => (
                <span
                  key={typeInfo.type.name}
                  className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full"
                >
                  {capitalize(typeInfo.type.name)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6 mb-4">
        <button
          onClick={handlePrevSlide}
          className="bg-yellow-300 hover:bg-sky-700 hover:text-white font-bold py-2 px-4 rounded-full transition"
        >
          Prev
        </button>
        <button
          onClick={handleNextSlide}
          className="bg-yellow-300 hover:bg-sky-700 hover:text-white font-bold py-2 px-4 rounded-full transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Cards;

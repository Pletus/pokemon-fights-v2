import React, { useState, useEffect } from "react";
import axios from "axios";

type Pokemon = {
  name: string;
  url: string;
};

type PokeAPIList = {
  results: Pokemon[];
};

const ClickGame: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        // Tipamos la respuesta con <PokeAPIList>
        const res = await axios.get<PokeAPIList>(
          "https://pokeapi.co/api/v2/pokemon?limit=50"
        );
        setPokemons(res.data.results); // TypeScript ya sabe el tipo
      } catch (err) {
        console.error(err);
      }
    };
    fetchPokemons();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleClick = () => {
    setScore((prev) => prev + 1);
    setCurrentIndex(Math.floor(Math.random() * pokemons.length));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6">Click Game</h2>
      <p className="mb-4">Time Left: {timeLeft}s | Score: {score}</p>

      {pokemons.length > 0 && timeLeft > 0 && (
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
            currentIndex + 1
          }.png`}
          alt={pokemons[currentIndex].name}
          className="w-32 h-32 cursor-pointer animate-bounce"
          onClick={handleClick}
        />
      )}

      {timeLeft <= 0 && (
        <p className="text-xl font-bold mt-4">Game Over! Score: {score}</p>
      )}
    </div>
  );
};

export default ClickGame;

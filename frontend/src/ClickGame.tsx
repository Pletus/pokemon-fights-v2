import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

type Pokemon = { name: string; url: string };
type PokeAPIList = { results: Pokemon[] };

type Spawn = {
  id: number;
  isTrap: boolean;
  isRare: boolean;
  isPowerUp: boolean;
  x: number;
  y: number;
};

const ClickGame: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [powerUp, setPowerUp] = useState<null | "double" | "freeze">(null);
  const freezeRef = useRef(false);

  // Fetch Pokémon list
  useEffect(() => {
    axios
      .get<PokeAPIList>("https://pokeapi.co/api/v2/pokemon?limit=200")
      .then((res) => setPokemons(res.data.results))
      .catch(console.error);
  }, []);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0 || freezeRef.current) return;

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Spawn logic every X milliseconds (dynamic difficulty)
  useEffect(() => {
    if (timeLeft <= 0) return;

    const spawnRate = Math.max(600 - score * 4, 250); // speed up as score increases

    const interval = setInterval(() => {
      spawnPokemon();
    }, spawnRate);

    return () => clearInterval(interval);
  }, [score, timeLeft]);

  const spawnPokemon = () => {
    if (pokemons.length === 0) return;

    const index = Math.floor(Math.random() * pokemons.length);

    const isTrap = Math.random() < 0.15;
    const isRare = Math.random() < 0.08;
    const isPowerUp = Math.random() < 0.05;

    const newSpawn: Spawn = {
      id: index + 1,
      isTrap,
      isRare,
      isPowerUp,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 10,
    };

    setSpawns((prev) =>
      [...prev, newSpawn].slice(-10) // keep last 10 spawns only
    );
  };

  const handleClick = (s: Spawn) => {
    if (s.isPowerUp) {
      activatePowerUp();
      removeSpawn(s);
      return;
    }

    if (s.isTrap) {
      setScore((s) => Math.max(0, s - 5));
      setCombo(0);
      removeSpawn(s);
      return;
    }

    let gained = 1;

    if (s.isRare) gained = 5;
    if (powerUp === "double") gained *= 2;

    setCombo((c) => c + 1);
    gained += Math.floor(combo / 5); // combo bonus

    setScore((p) => p + gained);

    removeSpawn(s);
  };

  const removeSpawn = (s: Spawn) => {
    setSpawns((prev) => prev.filter((p) => p !== s));
  };

  const activatePowerUp = () => {
    const roll = Math.random();

    if (roll < 0.5) {
      // double points for 5 seconds
      setPowerUp("double");
      setTimeout(() => setPowerUp(null), 5000);
    } else {
      // freeze timer 3 seconds
      freezeRef.current = true;
      setPowerUp("freeze");
      setTimeout(() => {
        freezeRef.current = false;
        setPowerUp(null);
      }, 3000);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* HUD */}
      <div className="p-4 flex justify-between items-center text-xl font-bold">
        <div>⏳ {timeLeft}s</div>
        <div>🔥 Combo: {combo}</div>
        <div>⭐ Score: {score}</div>
      </div>

      {/* Power up banner */}
      {powerUp && (
        <div className="text-center text-2xl py-2 bg-yellow-500 text-black font-extrabold animate-pulse">
          {powerUp === "double" && "⚡ DOUBLE POINTS!"}
          {powerUp === "freeze" && "❄️ TIME FROZEN!"}
        </div>
      )}

      {/* Game field */}
      <div className="relative w-full h-[80vh]">
        {spawns.map((s, i) => (
          <img
            key={i}
            src={
              s.isTrap
                ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.id}.png`
            }
            onClick={() => handleClick(s)}
            className={`absolute w-20 h-20 cursor-pointer transition-transform duration-150
              ${s.isTrap ? "grayscale brightness-50" : ""}
              ${s.isRare ? "drop-shadow-[0_0_10px_gold]" : ""}
              ${s.isPowerUp ? "animate-ping" : ""}
            `}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
            }}
          />
        ))}
      </div>

      {/* Game Over */}
      {timeLeft <= 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-extrabold mb-4">GAME OVER</h2>
          <p className="text-2xl mb-6">Score: {score}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-400 text-black text-xl font-bold rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ClickGame;

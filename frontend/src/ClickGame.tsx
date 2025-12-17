import React, { useState, useEffect } from "react";
import axios from "axios";

type Pokemon = { name: string; url: string };
type PokeAPIList = { results: Pokemon[] };

type SpawnType = "normal" | "rare" | "boss" | "trap" | "powerUp";

type Spawn = {
  id: number;
  type: SpawnType;
  x: number;
  y: number;
};

const ClickGame: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [powerUp, setPowerUp] = useState<
    null | "double" | "freeze" | "timeBoost"
  >(null);
  const [isFrozen, setIsFrozen] = useState(false);

  // Fetch Pokémon list
  useEffect(() => {
    axios
      .get<PokeAPIList>("https://pokeapi.co/api/v2/pokemon?limit=200")
      .then((res) => setPokemons(res.data.results))
      .catch(console.error);
  }, []);

  // Game loop: timer + spawn
  useEffect(() => {
    if (timeLeft <= 0) return;

    const loop = setInterval(() => {
      if (!isFrozen) setTimeLeft((t) => Math.max(0, t - 1));
      spawnPokemon();
    }, 1000);

    return () => clearInterval(loop);
  }, [isFrozen, pokemons, score, timeLeft]);

  const spawnPokemon = () => {
    if (pokemons.length === 0) return;

    const roll = Math.random();
    let type: SpawnType = "normal";

    if (roll < 0.05) type = "powerUp";
    else if (roll < 0.1) type = "boss";
    else if (roll < 0.2) type = "rare";
    else if (roll < 0.3) type = "trap";

    const index = Math.floor(Math.random() * pokemons.length);

    const newSpawn: Spawn = {
      id: index + 1,
      type,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 10,
    };

    setSpawns((prev) => [...prev, newSpawn].slice(-10));
  };

  const handleClick = (s: Spawn) => {
    if (s.type === "powerUp") {
      activatePowerUp();
      removeSpawn(s);
      return;
    }

    if (s.type === "trap") {
      setScore((s) => Math.max(0, s - 5));
      setCombo(0);
      removeSpawn(s);
      return;
    }

    // Base points según tipo
    let basePoints = 1;
    if (s.type === "rare") basePoints = 5;
    if (s.type === "boss") basePoints = 10;

    // Combo antes de incrementar
    const comboBonus = Math.floor(combo / 5);

    // Total points
    let totalPoints = basePoints + comboBonus;

    if (powerUp === "double") totalPoints *= 2;

    // Increment combo
    setCombo((c) => c + 1);

    // Update score
    setScore((s) => s + totalPoints);

    removeSpawn(s);
  };

  const removeSpawn = (s: Spawn) => {
    setSpawns((prev) => prev.filter((p) => p !== s));
  };

  const activatePowerUp = () => {
    const roll = Math.random();

    if (roll < 0.4) {
      // Double points 5s
      setPowerUp("double");
      setTimeout(() => setPowerUp(null), 5000);
    } else if (roll < 0.7) {
      // Freeze 3s
      setIsFrozen(true);
      setPowerUp("freeze");
      setTimeout(() => {
        setIsFrozen(false);
        setPowerUp(null);
      }, 3000);
    } else {
      // Time boost +5s
      setTimeLeft((t) => t + 5);
      setPowerUp("timeBoost");
      setTimeout(() => setPowerUp(null), 3000);
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
          {powerUp === "timeBoost" && "⏱️ TIME BOOST!"}
        </div>
      )}

      {/* Game field */}
      <div className="relative w-full h-[80vh]">
        {spawns.map((s, i) => (
          <img
            key={i}
            src={
              s.type === "trap"
                ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.id}.png`
            }
            onClick={() => handleClick(s)}
            className={`absolute w-20 h-20 cursor-pointer transition-transform duration-150
              ${s.type === "trap" ? "grayscale brightness-50" : ""}
              ${s.type === "rare" ? "drop-shadow-[0_0_10px_gold]" : ""}
              ${s.type === "boss" ? "drop-shadow-[0_0_15px_red]" : ""}
              ${s.type === "powerUp" ? "animate-ping" : ""}
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

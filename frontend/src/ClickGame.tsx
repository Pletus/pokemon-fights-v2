import React, { useEffect, useState } from "react";
import axios from "axios";

// =====================
// Types
// =====================
type Pokemon = { name: string; url: string };
type PokeAPIList = { results: Pokemon[] };

type SpawnType = "normal" | "rare" | "boss" | "trap" | "powerUp";

type Spawn = {
  id: number;
  type: SpawnType;
  x: number; // %
  y: number; // % (lane)
};

// =====================
// Tunables (game feel)
// =====================
const GAME_TIME = 30;
const MIN_DISTANCE = 20; // % distance between spawns
const LANES = [20, 45, 70]; // vertical lanes
const MAX_SPAWNS = 8;

// =====================
// Helpers
// =====================
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function canSpawnHere(x: number, y: number, existing: Spawn[]) {
  return existing.every((s) => distance({ x, y }, s) > MIN_DISTANCE);
}

// =====================
// Component
// =====================
const ClickGame: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [powerUp, setPowerUp] = useState<
    null | "double" | "freeze" | "timeBoost"
  >(null);
  const [isFrozen, setIsFrozen] = useState(false);

  // =====================
  // Fetch Pokémon list
  // =====================
  useEffect(() => {
    axios
      .get<PokeAPIList>("https://pokeapi.co/api/v2/pokemon?limit=200")
      .then((res) => setPokemons(res.data.results))
      .catch(console.error);
  }, []);

  // =====================
  // Game loop (human-friendly pacing)
  // =====================
  useEffect(() => {
    if (timeLeft <= 0) return;

    const delay = Math.random() * 400 + 1200; // 1200–1600ms

    const timer = setTimeout(() => {
      if (!isFrozen) {
        setTimeLeft((t) => Math.max(0, t - 1));
        spawnPokemon();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [timeLeft, isFrozen, pokemons, spawns]);

  // =====================
  // Spawn logic (fair)
  // =====================
  const spawnPokemon = () => {
    if (pokemons.length === 0) return;

    const dangerousOnScreen = spawns.filter(
      (s) => s.type === "trap" || s.type === "boss"
    ).length;

    let roll = Math.random();
    let type: SpawnType = "normal";

    if (roll < 0.05) type = "powerUp";
    else if (roll < 0.1 && dangerousOnScreen === 0) type = "boss";
    else if (roll < 0.2) type = "rare";
    else if (roll < 0.3 && dangerousOnScreen === 0) type = "trap";

    const id = Math.floor(Math.random() * pokemons.length) + 1;
    const y = LANES[Math.floor(Math.random() * LANES.length)];

    let x = Math.random() * 70 + 15;
    let tries = 0;

    while (!canSpawnHere(x, y, spawns) && tries < 10) {
      x = Math.random() * 70 + 15;
      tries++;
    }

    if (tries >= 10) return; // no space → skip spawn

    const newSpawn: Spawn = { id, type, x, y };

    setSpawns((prev) => [...prev, newSpawn].slice(-MAX_SPAWNS));
  };

  // =====================
  // Click handling
  // =====================
  const handleClick = (s: Spawn) => {
    if (s.type === "powerUp") {
      activatePowerUp();
      removeSpawn(s);
      return;
    }

    if (s.type === "trap") {
      setScore((sc) => Math.max(0, sc - 5));
      setCombo(0);
      removeSpawn(s);
      return;
    }

    let base = 1;
    if (s.type === "rare") base = 5;
    if (s.type === "boss") base = 10;

    const comboBonus = Math.floor(combo / 5);
    let total = base + comboBonus;

    if (powerUp === "double") total *= 2;

    setCombo((c) => c + 1);
    setScore((sc) => sc + total);

    removeSpawn(s);
  };

  const removeSpawn = (s: Spawn) => {
    setSpawns((prev) => prev.filter((p) => p !== s));
  };

  // =====================
  // PowerUps
  // =====================
  const activatePowerUp = () => {
    const roll = Math.random();

    if (roll < 0.4) {
      setPowerUp("double");
      setTimeout(() => setPowerUp(null), 5000);
    } else if (roll < 0.7) {
      setIsFrozen(true);
      setPowerUp("freeze");
      setTimeout(() => {
        setIsFrozen(false);
        setPowerUp(null);
      }, 3000);
    } else {
      setTimeLeft((t) => t + 5);
      setPowerUp("timeBoost");
      setTimeout(() => setPowerUp(null), 3000);
    }
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* HUD */}
      <div className="p-4 flex justify-between items-center text-xl font-bold">
        <div>⏳ {timeLeft}s</div>
        <div>🔥 Combo: {combo}</div>
        <div>⭐ Score: {score}</div>
      </div>

      {/* PowerUp banner */}
      {powerUp && (
        <div className="text-center text-2xl py-2 bg-yellow-500 text-black font-extrabold animate-pulse">
          {powerUp === "double" && "⚡ DOUBLE POINTS!"}
          {powerUp === "freeze" && "❄️ TIME FROZEN!"}
          {powerUp === "timeBoost" && "⏱️ TIME BOOST!"}
        </div>
      )}

      {/* Game field */}
      <div className="relative w-full h-[80vh]">
        {spawns.map((s) => (
          <img
            key={`${s.id}-${s.x}-${s.y}`}
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
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
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

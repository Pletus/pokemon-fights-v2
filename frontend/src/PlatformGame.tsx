// PLATFORM GAME — FIXED & PLAYABLE
// - Hold jump (variable height)
// - Guaranteed safe first obstacle
// - Impossible spawn patterns removed
// - No Space key scroll

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// ---------------- TYPES ----------------
type Pokemon = { name: string; url: string };
type PokeAPIList = { results: Pokemon[] };

// ---------------- CONSTANTS ----------------
const GRAVITY = 0.65;
const BASE_JUMP = -12;
const HOLD_JUMP_FORCE = -0.6; // applied while key held
const MAX_HOLD_TIME = 220; // ms

const TICK = 30;
const GAME_WIDTH = 800;
const GROUND_Y = 0;

const FIRST_OBSTACLE_DELAY = 1200; // ms – critical fix
const MIN_OBSTACLE_GAP = 300; // guarantees jumpable distance
const OBSTACLE_SPEED = 5;

// ---------------- COMPONENT ----------------
const PlatformGame: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [playerY, setPlayerY] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isHoldingJump, setIsHoldingJump] = useState(false);
  const [jumpStart, setJumpStart] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [obstacles, setObstacles] = useState<{ x: number; id: number }[]>([]);
  const gameStartTime = useRef(Date.now());

  const playerRef = useRef<HTMLDivElement | null>(null);

  // ---------------- FETCH ----------------
  useEffect(() => {
    axios
      .get<PokeAPIList>("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((r) => setPokemons(r.data.results))
      .catch(console.error);
  }, []);

  // ---------------- INPUT ----------------
  const startJump = () => {
    if (gameOver || isJumping) return;
    setVelocityY(BASE_JUMP);
    setIsJumping(true);
    setIsHoldingJump(true);
    setJumpStart(Date.now());
  };

  const stopJump = () => {
    setIsHoldingJump(false);
    setJumpStart(null);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyZ") {
        e.preventDefault();
        startJump();
      }
      if (gameOver && e.code === "Enter") restart();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyZ") stopJump();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isJumping, gameOver]);

  // ---------------- GAME LOOP ----------------
  useEffect(() => {
    if (gameOver) return;

    const loop = setInterval(() => {
      // ---- physics
      setPlayerY((y) => {
        let vy = velocityY;

        // variable jump height
        if (
          isHoldingJump &&
          jumpStart &&
          Date.now() - jumpStart < MAX_HOLD_TIME
        ) {
          vy += HOLD_JUMP_FORCE;
        }

        vy += GRAVITY;
        let nextY = y + vy;

        if (nextY >= GROUND_Y) {
          nextY = GROUND_Y;
          setIsJumping(false);
          setIsHoldingJump(false);
        }

        setVelocityY(vy);
        return nextY;
      });

      setScore((s) => s + 1);

      // ---- move obstacles
      setObstacles((obs) =>
        obs
          .map((o) => ({ ...o, x: o.x - OBSTACLE_SPEED }))
          .filter((o) => o.x > -80)
      );

      // ---- spawn obstacles (HARD RULES)
      setObstacles((obs) => {
        const elapsed = Date.now() - gameStartTime.current;
        if (elapsed < FIRST_OBSTACLE_DELAY) return obs;

        const last = obs[obs.length - 1];
        const canSpawn = !last || last.x < GAME_WIDTH - MIN_OBSTACLE_GAP;

        if (canSpawn && Math.random() < 0.018 && pokemons.length > 0) {
          const id = Math.floor(Math.random() * 151) + 1;
          return [...obs, { x: GAME_WIDTH, id }];
        }
        return obs;
      });
    }, TICK);

    return () => clearInterval(loop);
  }, [velocityY, isHoldingJump, jumpStart, gameOver, pokemons]);

  // ---------------- COLLISION ----------------
  useEffect(() => {
    if (!playerRef.current || gameOver) return;
    const p = playerRef.current.getBoundingClientRect();

    obstacles.forEach((o) => {
      const el = document.getElementById(`obs-${o.id}`);
      if (!el) return;
      const b = el.getBoundingClientRect();

      const hit =
        p.right - 12 > b.left &&
        p.left + 12 < b.right &&
        p.bottom > b.top + 14;

      if (hit) setGameOver(true);
    });
  }, [obstacles, gameOver]);

  // ---------------- RESTART ----------------
  const restart = () => {
    gameStartTime.current = Date.now();
    setGameOver(false);
    setPlayerY(0);
    setVelocityY(0);
    setObstacles([]);
    setScore(0);
    setIsJumping(false);
    setIsHoldingJump(false);
  };

  // ---------------- RENDER ----------------
  return (
    <div className="w-full h-screen bg-gray-200 flex flex-col items-center pt-6 select-none">
      <h2 className="text-3xl font-bold mb-1">Pokémon Runner</h2>
      <p className="text-sm mb-2">Hold ↑ or Z to jump higher</p>

      <p className="mb-4 font-semibold">
        Score: {score}
        {gameOver && <span className="ml-3 text-red-600">Game Over – Enter</span>}
      </p>

      <div
        className="relative bg-white border shadow-lg overflow-hidden"
        style={{ width: GAME_WIDTH, height: 250 }}
      >
        <div className="absolute bottom-0 w-full h-2 bg-green-600" />

        <div
          ref={playerRef}
          className="absolute bottom-0 left-16"
          style={{ transform: `translateY(${playerY}px)` }}
        >
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            className="w-16 h-16"
          />
        </div>

        {obstacles.map((o, i) => (
          <img
            key={i}
            id={`obs-${o.id}`}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${o.id}.png`}
            className="absolute bottom-0 w-14 h-14"
            style={{ left: o.x }}
          />
        ))}
      </div>
    </div>
  );
};

export default PlatformGame;

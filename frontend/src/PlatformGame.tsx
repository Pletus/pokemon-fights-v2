import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

type Pokemon = { name: string; url: string };
type PokeAPIList = { results: Pokemon[] };

const GRAVITY = 0.6;
const JUMP_FORCE = -12;

const PlatformGame: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [playerY, setPlayerY] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [obstacles, setObstacles] = useState<
    { x: number; id: number }[]
  >([]);

  const playerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Pokémon list
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await axios.get<PokeAPIList>(
          "https://pokeapi.co/api/v2/pokemon?limit=151"
        );
        setPokemons(res.data.results);
      } catch (err) {
        console.error("Error fetching Pokémon", err);
      }
    };
    fetchList();
  }, []);

  // 2. Jump when pressing space or clicking
  const jump = () => {
    if (gameOver) return;

    if (!isJumping) {
      setVelocityY(JUMP_FORCE);
      setIsJumping(true);
    }
  };

  // Keyboard jump
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") jump();
      if (gameOver && e.code === "Enter") restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isJumping, gameOver]);

  // 3. Physics loop
  useEffect(() => {
    if (gameOver) return;

    const loop = setInterval(() => {
      setPlayerY((prev) => {
        let newY = prev + velocityY;
        let vel = velocityY + GRAVITY;

        setVelocityY(vel);

        // Ground collision
        if (newY >= 0) {
          newY = 0;
          setIsJumping(false);
        }

        return newY;
      });

      setScore((s) => s + 1);

      // Move obstacles
      setObstacles((obs) =>
        obs
          .map((o) => ({ ...o, x: o.x - 6 }))
          .filter((o) => o.x > -80)
      );

      // Chance to spawn new obstacle
      if (Math.random() < 0.03 && pokemons.length > 0) {
        const id = Math.floor(Math.random() * 151) + 1;
        setObstacles((o) => [...o, { x: 800, id }]);
      }
    }, 30);

    return () => clearInterval(loop);
  }, [velocityY, gameOver, pokemons]);

  // 4. Collision detection
  useEffect(() => {
    if (!playerRef.current || !gameRef.current || gameOver) return;

    const playerBox = playerRef.current.getBoundingClientRect();

    obstacles.forEach((obs) => {
      const el = document.getElementById(`obs-${obs.id}`);
      if (!el) return;

      const obsBox = el.getBoundingClientRect();

      const overlap =
        playerBox.left < obsBox.right &&
        playerBox.right > obsBox.left &&
        playerBox.top < obsBox.bottom &&
        playerBox.bottom > obsBox.top;

      if (overlap) {
        setGameOver(true);
      }
    });
  }, [obstacles, gameOver]);

  // 5. Restart
  const restart = () => {
    setGameOver(false);
    setPlayerY(0);
    setVelocityY(0);
    setObstacles([]);
    setScore(0);
    setIsJumping(false);
  };

  const playerId = 25; // Pikachu runner

  return (
    <div
      className="w-full h-screen bg-gray-200 flex flex-col items-center pt-6"
      onClick={jump}
    >
      <h2 className="text-3xl font-bold mb-2">Pokémon Runner</h2>
      <p className="mb-3 text-sm text-gray-600">
        Press <b>SPACE</b> or click to jump — Avoid Pokémon!
      </p>

      <p className="text-lg font-semibold mb-5">
        Score: {score}{" "}
        {gameOver && <span className="ml-2 text-red-600">Game Over! Press ENTER</span>}
      </p>

      {/* GAME BOX */}
      <div
        ref={gameRef}
        className="relative bg-white border shadow-lg overflow-hidden"
        style={{ width: 800, height: 250 }}
      >
        {/* Ground line */}
        <div className="absolute bottom-0 w-full h-2 bg-green-600" />

        {/* PLAYER */}
        <div
          ref={playerRef}
          className="absolute bottom-0"
          style={{
            transform: `translateY(${playerY}px)`,
            transition: "none",
          }}
        >
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerId}.png`}
            className="w-16 h-16"
          />
        </div>

        {/* OBSTACLES */}
        {obstacles.map((o) => (
          <img
            key={o.x + "-" + o.id}
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

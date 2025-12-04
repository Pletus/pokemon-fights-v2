import React, { useEffect, useState } from "react";
import { Pokemon } from "./types/pokemon";
import { FightResult, SelectedPokemons } from "./types/fight";

const BASE_URL = "https://pokefight-u2oc.onrender.com";

const FightPreview: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemons, setSelectedPokemons] = useState<SelectedPokemons>({
    left: null,
    right: null,
  });
  const [winner, setWinner] = useState<string | null>(null);
  const [fightLogs, setFightLogs] = useState<string[]>([]);
  const [battleHistory, setBattleHistory] = useState<FightResult[]>([]);
  const [leftHp, setLeftHp] = useState(0);
  const [rightHp, setRightHp] = useState(0);

  // Cargar Pokémon
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((res) => res.json())
      .then((data) => {
        Promise.all(
          data.results.map((p: { url: string }) =>
            fetch(p.url).then((r) => r.json())
          )
        ).then((pokemonDetails: any[]) => {
          const formatted: Pokemon[] = pokemonDetails.map((pokemon, index) => ({
            id: index + 1,
            name: { english: pokemon.name },
            stats: pokemon.stats,
            abilities: pokemon.abilities,
            types: pokemon.types,
            sprites: pokemon.sprites, // sprite completo
          }));
          setPokemons(formatted);
        });
      })
      .catch(console.error);
  }, []);

  // Cargar historial de batallas
  useEffect(() => {
    fetch(`${BASE_URL}/api/fight-logs`)
      .then((res) => res.json())
      .then((data: FightResult[]) => setBattleHistory(data))
      .catch(console.error);
  }, []);

  // Función de daño más realista
  const calculateDamage = (attacker: Pokemon, defender: Pokemon) => {
    const attack = attacker.stats.find((s) => s.stat.name === "attack")?.base_stat || 50;
    const defense = defender.stats.find((s) => s.stat.name === "defense")?.base_stat || 50;
    const level = 50;
    const movePower = 50;
    const randomFactor = 0.85 + Math.random() * 0.15;
    const baseDamage = (((2 * level) / 5 + 2) * attack * movePower) / defense / 50 + 2;
    return Math.max(Math.floor(baseDamage * randomFactor), 1);
  };

  // Lógica del combate
  const handleFight = () => {
    if (!selectedPokemons.left || !selectedPokemons.right) return;

    let leftCurrentHp = selectedPokemons.left.stats.find((s) => s.stat.name === "hp")?.base_stat || 100;
    let rightCurrentHp = selectedPokemons.right.stats.find((s) => s.stat.name === "hp")?.base_stat || 100;

    setLeftHp(leftCurrentHp);
    setRightHp(rightCurrentHp);

    const logs: string[] = [];

    while (leftCurrentHp > 0 && rightCurrentHp > 0) {
      // Decide quien ataca primero por velocidad
      const leftSpeed = selectedPokemons.left.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;
      const rightSpeed = selectedPokemons.right.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;
      const first = leftSpeed >= rightSpeed ? "left" : "right";

      if (first === "left") {
        const damage = calculateDamage(selectedPokemons.left, selectedPokemons.right);
        rightCurrentHp = Math.max(rightCurrentHp - damage, 0);
        logs.push(`${selectedPokemons.left.name.english} hits ${selectedPokemons.right.name.english} for ${damage} damage! (${rightCurrentHp} HP left)`);

        if (rightCurrentHp <= 0) break;

        const damage2 = calculateDamage(selectedPokemons.right, selectedPokemons.left);
        leftCurrentHp = Math.max(leftCurrentHp - damage2, 0);
        logs.push(`${selectedPokemons.right.name.english} hits ${selectedPokemons.left.name.english} for ${damage2} damage! (${leftCurrentHp} HP left)`);
      } else {
        const damage = calculateDamage(selectedPokemons.right, selectedPokemons.left);
        leftCurrentHp = Math.max(leftCurrentHp - damage, 0);
        logs.push(`${selectedPokemons.right.name.english} hits ${selectedPokemons.left.name.english} for ${damage} damage! (${leftCurrentHp} HP left)`);

        if (leftCurrentHp <= 0) break;

        const damage2 = calculateDamage(selectedPokemons.left, selectedPokemons.right);
        rightCurrentHp = Math.max(rightCurrentHp - damage2, 0);
        logs.push(`${selectedPokemons.left.name.english} hits ${selectedPokemons.right.name.english} for ${damage2} damage! (${rightCurrentHp} HP left)`);
      }
    }

    setLeftHp(leftCurrentHp);
    setRightHp(rightCurrentHp);

    if (leftCurrentHp <= 0 && rightCurrentHp <= 0) setWinner("draw");
    else if (leftCurrentHp > 0) setWinner(selectedPokemons.left.name.english);
    else setWinner(selectedPokemons.right.name.english);

    setFightLogs(logs);

    // Guardar resultado
    fetch(`${BASE_URL}/api/fight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pokemon1: selectedPokemons.left.name.english,
        pokemon2: selectedPokemons.right.name.english,
        winner:
          leftCurrentHp <= 0 && rightCurrentHp <= 0
            ? "draw"
            : leftCurrentHp > rightCurrentHp
            ? selectedPokemons.left.name.english
            : selectedPokemons.right.name.english,
        battleLog: logs,
      }),
    }).catch(console.error);
  };

  const handleSelect = (side: "left" | "right", id: number) => {
    const selected = pokemons.find((p) => p.id === id) || null;
    if (side === "left" && selected) {
      const randomRight = pokemons.filter((p) => p.id !== id)[
        Math.floor(Math.random() * (pokemons.length - 1))
      ];
      setSelectedPokemons({ left: selected, right: randomRight });
      setWinner(null);
      setFightLogs([]);
      setLeftHp(selected.stats.find((s) => s.stat.name === "hp")?.base_stat || 100);
      setRightHp(randomRight.stats.find((s) => s.stat.name === "hp")?.base_stat || 100);
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const hpBar = (current: number, max: number) => {
    const percentage = Math.max((current / max) * 100, 0);
    const color =
      percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-yellow-400" : "bg-red-500";
    return (
      <div className="w-32 h-4 bg-gray-300 rounded-full">
        <div className={`${color} h-4 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-8 my-12 px-4 md:px-0">
      <h1 className="text-3xl font-bold text-center">Pokémon Fight Arena</h1>

      <div className="flex flex-col md:flex-row items-center md:space-x-12 space-y-4 md:space-y-0">
        {/* Pokémon izquierdo */}
        <div className="flex flex-col items-center">
          {selectedPokemons.left && (
            <>
              <img
                src={selectedPokemons.left.sprites.front_default}
                alt={selectedPokemons.left.name.english}
                className="w-32 h-32 object-contain mb-2"
              />
              {hpBar(leftHp, selectedPokemons.left.stats.find(s => s.stat.name === "hp")?.base_stat || 100)}
            </>
          )}
          <select
            onChange={(e) => handleSelect("left", Number(e.target.value))}
            value={selectedPokemons.left?.id || ""}
            className="px-4 py-2 border rounded shadow"
          >
            <option value="" disabled>Select Pokémon</option>
            {pokemons.map((p) => (
              <option key={p.id} value={p.id}>{capitalize(p.name.english)}</option>
            ))}
          </select>
        </div>

        <span className="text-2xl font-bold">VS</span>

        {/* Pokémon derecho */}
        <div className="flex flex-col items-center">
          {selectedPokemons.right && (
            <>
              <img
                src={selectedPokemons.right.sprites.front_default}
                alt={selectedPokemons.right.name.english}
                className="w-32 h-32 object-contain mb-2"
              />
              {hpBar(rightHp, selectedPokemons.right.stats.find(s => s.stat.name === "hp")?.base_stat || 100)}
            </>
          )}
          <select
            value={selectedPokemons.right?.id || ""}
            className="px-4 py-2 border rounded shadow bg-gray-100 cursor-not-allowed"
            disabled
          >
            <option value="">Randomly Selected</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleFight}
        className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
      >
        Fight
      </button>

      {winner && (
        <div className="mt-6 w-full md:w-2/3 p-4 bg-gray-50 rounded shadow">
          <h2 className="text-xl font-bold mb-2 text-center">
            {winner === "draw" ? "It's a Draw!" : `${winner} wins!`}
          </h2>
          <ul className="list-disc list-inside space-y-1 max-h-60 overflow-y-auto">
            {fightLogs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FightPreview;


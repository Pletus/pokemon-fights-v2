import React, { useEffect, useState } from "react";
import { Pokemon } from "./types/pokemon";
import { FightResult, SelectedPokemons } from "./types/fight";

const FightPreview: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selectedPokemons, setSelectedPokemons] = useState<SelectedPokemons>({
    left: null,
    right: null,
  });
  const [winner, setWinner] = useState<string | null>(null);
  const [fightLogs, setFightLogs] = useState<string[]>([]);
  const [leftHp, setLeftHp] = useState(0);
  const [rightHp, setRightHp] = useState(0);
  const [combatInProgress, setCombatInProgress] = useState(false);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((res) => res.json())
      .then((data) =>
        Promise.all(data.results.map((p: any) => fetch(p.url).then((r) => r.json())))
      )
      .then((details: any[]) => {
        const formatted: Pokemon[] = details.map((pokemon, index) => ({
          id: index + 1,
          name: { english: pokemon.name || "Unknown" },
          stats: pokemon.stats || [],
          abilities: pokemon.abilities || [],
          types: pokemon.types || [],
          sprites: pokemon.sprites || { front_default: "" },
          species: pokemon.species || {},
        }));
        setPokemons(formatted);
      });
  }, []);

  const capitalize = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const hpBar = (current: number, max: number) => {
    const pct = Math.max((current / max) * 100, 0);
    const color =
      pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-400" : "bg-red-500";

    return (
      <div className="w-32 h-4 bg-gray-300 rounded-full border border-black">
        <div className={`${color} h-4 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
    );
  };

  const calculateDamage = (attacker: Pokemon, defender: Pokemon) => {
    const attack =
      attacker.stats.find((s) => s.stat.name === "attack")?.base_stat || 50;
    const defense =
      defender.stats.find((s) => s.stat.name === "defense")?.base_stat || 50;
    const level = 50;
    const movePower = 50;
    const randomFactor = 0.85 + Math.random() * 0.15;
    const baseDamage =
      (((2 * level) / 5 + 2) * attack * movePower) / defense / 50 + 2;

    return Math.max(Math.floor(baseDamage * randomFactor), 1);
  };

  const handleFight = async () => {
    if (!selectedPokemons.left || !selectedPokemons.right) return;

    setCombatInProgress(true);

    let leftCurrentHp =
      selectedPokemons.left.stats.find((s) => s.stat.name === "hp")?.base_stat || 100;
    let rightCurrentHp =
      selectedPokemons.right.stats.find((s) => s.stat.name === "hp")?.base_stat || 100;

    setLeftHp(leftCurrentHp);
    setRightHp(rightCurrentHp);
    setFightLogs([]);
    setWinner(null);

    const logs: string[] = [];

    // Turnos asíncronos simulados
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    while (leftCurrentHp > 0 && rightCurrentHp > 0) {
      const leftSpeed =
        selectedPokemons.left.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;
      const rightSpeed =
        selectedPokemons.right.stats.find((s) => s.stat.name === "speed")?.base_stat || 50;
      const first = leftSpeed >= rightSpeed ? "left" : "right";

      if (first === "left") {
        const dmg = calculateDamage(selectedPokemons.left, selectedPokemons.right);
        rightCurrentHp = Math.max(rightCurrentHp - dmg, 0);
        logs.push(`${capitalize(selectedPokemons.left.name.english)} hits ${capitalize(selectedPokemons.right.name.english)} for ${dmg}! (${rightCurrentHp} HP left)`);
        setFightLogs([...logs]);
        setRightHp(rightCurrentHp);
        if (rightCurrentHp <= 0) break;
        await sleep(800);

        const dmg2 = calculateDamage(selectedPokemons.right, selectedPokemons.left);
        leftCurrentHp = Math.max(leftCurrentHp - dmg2, 0);
        logs.push(`${capitalize(selectedPokemons.right.name.english)} hits ${capitalize(selectedPokemons.left.name.english)} for ${dmg2}! (${leftCurrentHp} HP left)`);
        setFightLogs([...logs]);
        setLeftHp(leftCurrentHp);
        await sleep(800);
      } else {
        const dmg = calculateDamage(selectedPokemons.right, selectedPokemons.left);
        leftCurrentHp = Math.max(leftCurrentHp - dmg, 0);
        logs.push(`${capitalize(selectedPokemons.right.name.english)} hits ${capitalize(selectedPokemons.left.name.english)} for ${dmg}! (${leftCurrentHp} HP left)`);
        setFightLogs([...logs]);
        setLeftHp(leftCurrentHp);
        if (leftCurrentHp <= 0) break;
        await sleep(800);

        const dmg2 = calculateDamage(selectedPokemons.left, selectedPokemons.right);
        rightCurrentHp = Math.max(rightCurrentHp - dmg2, 0);
        logs.push(`${capitalize(selectedPokemons.left.name.english)} hits ${capitalize(selectedPokemons.right.name.english)} for ${dmg2}! (${rightCurrentHp} HP left)`);
        setFightLogs([...logs]);
        setRightHp(rightCurrentHp);
        await sleep(800);
      }
    }

    const fightWinner =
      leftCurrentHp <= 0 && rightCurrentHp <= 0
        ? "draw"
        : leftCurrentHp > rightCurrentHp
        ? selectedPokemons.left.name.english
        : selectedPokemons.right.name.english;

    setWinner(fightWinner);
    setCombatInProgress(false);

    // Guardar historial local
    const saved = localStorage.getItem("fightHistory");
    const history: FightResult[] = saved ? JSON.parse(saved) : [];
    history.unshift({
      pokemon1: selectedPokemons.left.name.english,
      pokemon2: selectedPokemons.right.name.english,
      winner: fightWinner,
      battleLog: logs,
    });
    localStorage.setItem("fightHistory", JSON.stringify(history));
  };

  const handleSelect = (side: "left" | "right", id: number) => {
    const selected = pokemons.find((p) => p.id === id) || null;
    if (!selected) return;
    const randomOpponent =
      pokemons.filter((p) => p.id !== id)[
        Math.floor(Math.random() * (pokemons.length - 1))
      ];

    setSelectedPokemons({ left: selected, right: randomOpponent });
    setWinner(null);
    setFightLogs([]);
    setLeftHp(selected.stats.find((s) => s.stat.name === "hp")?.base_stat || 100);
    setRightHp(randomOpponent.stats.find((s) => s.stat.name === "hp")?.base_stat || 100);
  };

  return (
    <div className="flex flex-col items-center my-12 px-4 md:px-0">
      <h1 className="text-4xl font-bold text-center mb-8">Pokémon Fight Arena</h1>

      <div className="flex flex-col md:flex-row items-center md:space-x-12 space-y-4 md:space-y-0">
        {/* Left */}
        <div className="flex flex-col items-center">
          {selectedPokemons.left && (
            <>
              <img src={selectedPokemons.left.sprites.front_default} alt={selectedPokemons.left.name.english} className="w-32 h-32 object-contain mb-2" />
              {hpBar(leftHp, selectedPokemons.left.stats.find((s) => s.stat.name === "hp")?.base_stat || 100)}
            </>
          )}
          <select
            onChange={(e) => handleSelect("left", Number(e.target.value))}
            value={selectedPokemons.left?.id || ""}
            className="px-4 py-2 border rounded shadow"
            disabled={combatInProgress}
          >
            <option value="" disabled>Select Pokémon</option>
            {pokemons.map((p) => (
              <option key={p.id} value={p.id}>{capitalize(p.name.english)}</option>
            ))}
          </select>
        </div>

        <span className="text-2xl font-bold">VS</span>

        {/* Right */}
        <div className="flex flex-col items-center">
          {selectedPokemons.right && (
            <>
              <img src={selectedPokemons.right.sprites.front_default} alt={selectedPokemons.right.name.english} className="w-32 h-32 object-contain mb-2" />
              {hpBar(rightHp, selectedPokemons.right.stats.find((s) => s.stat.name === "hp")?.base_stat || 100)}
            </>
          )}
          <select value={selectedPokemons.right?.id || ""} className="px-4 py-2 border rounded shadow bg-gray-100 cursor-not-allowed" disabled>
            <option value="">Randomly Selected</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleFight}
        className={`px-6 py-2 mt-6 rounded shadow text-white transition ${combatInProgress ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        disabled={combatInProgress}
      >
        {combatInProgress ? "Fighting..." : "Fight"}
      </button>

      {winner && (
        <div className="mt-8 w-full md:w-2/3 p-4 bg-gray-50 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-3">{winner === "draw" ? "It's a Draw!" : `${capitalize(winner)} wins!`}</h2>
          <ul className="space-y-2 max-h-60 overflow-y-auto text-sm leading-relaxed">
            {fightLogs.map((log, i) => (
              <li key={i}>▶ {log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FightPreview;

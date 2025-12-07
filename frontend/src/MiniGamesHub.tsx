import React from "react";
import { useNavigate } from "react-router-dom";

const MiniGamesHub: React.FC = () => {
  const navigate = useNavigate();

  const games = [
    {
      title: "Memory Game",
      description: "Encuentra todos los pares de Pokémon.",
      route: "/minigames/memory",
      color: "bg-blue-400",
    },
    {
      title: "Click Frenzy",
      description: "Haz clic en los Pokémon correctos y evita los malos.",
      route: "/minigames/click",
      color: "bg-green-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-8">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
        Pokémon Mini Games
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <div
            key={game.title}
            className={`rounded-2xl shadow-lg p-6 cursor-pointer hover:scale-105 transform transition ${game.color} text-white`}
            onClick={() => navigate(game.route)}
          >
            <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
            <p className="text-sm">{game.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniGamesHub;

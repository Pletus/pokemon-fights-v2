import React, { useState, useEffect } from "react";
import axios from "axios";
import { FightResult } from "./types/fight";

const BASE_URL = "https://pokefight-u2oc.onrender.com";

const ResultsTable: React.FC = () => {
  const [battleHistory, setBattleHistory] = useState<FightResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("fightHistory");
    if (saved) setBattleHistory(JSON.parse(saved));
  }, []);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 md:px-8 lg:px-16">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10">
        Fight Results
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full md:w-4/5 mx-auto bg-white shadow-lg rounded-xl border border-gray-200">
          <thead className="bg-gradient-to-r from-red-400 to-red-500 text-white uppercase text-sm md:text-base tracking-wide rounded-t-xl">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-xl">Pokemon 1</th>
              <th className="py-3 px-4 text-left">Pokemon 2</th>
              <th className="py-3 px-4 text-left">Winner</th>
              <th className="py-3 px-4 text-left rounded-tr-xl">Battle Log</th>
            </tr>
          </thead>
          <tbody>
            {battleHistory.map((fight, index) => (
              <tr key={index} className="transition-colors duration-300 hover:bg-gray-50 border-b border-gray-200">
                <td className="py-3 px-4">{capitalize(fight.pokemon1)}</td>
                <td className="py-3 px-4">{capitalize(fight.pokemon2)}</td>
                <td className="py-3 px-4 text-blue-500 font-semibold">{capitalize(fight.winner)}</td>
                <td className="py-3 px-4 max-w-xs">
                  <ul className="list-disc list-inside text-gray-600 space-y-1 max-h-48 overflow-y-auto">
                    {fight.battleLog.map((log, idx) => (
                      <li key={idx}>{capitalize(log)}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;

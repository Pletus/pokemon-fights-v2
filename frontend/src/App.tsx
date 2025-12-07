import "./App.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Main from "./Main";
import Cards from "./Cards";
import FightPreview from "./FightPreview";
import ResultsTable from "./ResultTable";
import Card from "./Card";
import MiniGamesHub from "./MiniGamesHub";
import MemoryGame from "./MemoryGame";
import ClickGame from "./ClickGame";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />

        {/* Pokémon */}
        <Route path="/pokedex" element={<Cards />} />
        <Route path="/pokemon/:id/details" element={<Card />} />

        {/* Fights */}
        <Route path="/fight" element={<FightPreview />} />
        <Route path="/fightResults" element={<ResultsTable />} />

        {/* Minigames */}
        <Route path="/minigames" element={<MiniGamesHub />} />
        <Route path="/minigames/memory" element={<MemoryGame />} />
        <Route path="/minigames/click" element={<ClickGame />} />
      </Route>
    </Routes>
  );
}

export default App;


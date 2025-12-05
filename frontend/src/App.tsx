import "./App.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Main from "./Main";
import Cards from './Cards';
import FightPreview from "./FightPreview";
import ResultsTable from "./ResultTable";
import Card from "./Card"; // <-- nuevo componente

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route path="/pokedex" element={<Cards />} />
        <Route path="/fight" element={<FightPreview />} />
        <Route path="/fightResults" element={<ResultsTable />} />
        <Route path="/pokemon/:id/details" element={<Card />} /> {/* ruta corregida */}
      </Route>
    </Routes>
  );
}

export default App;


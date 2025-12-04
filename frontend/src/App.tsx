import "./App.css";
import { Route, Routes, useParams } from "react-router-dom";
import Layout from "./Layout";
import Main from "./Main";
import Cards from './Cards';
import FightPreview from "./FightPreview";
import ResultsTable from "./ResultTable";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route path="/pokedex" element={<Cards />} />
        <Route path="/fight" element={<FightPreview />} />
        <Route path="/fightResults" element={<ResultsTable />} /> {/* Add this route */}
        <Route path="/pokemon/:id/:info" />
      </Route>
    </Routes>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CocktailDetail from "./pages/CocktailDetail";
import Header from "./components/Header";
import Compte from "./pages/Compte";
import MesCocktails from "./pages/MesCocktails";
import MesFavoris from "./pages/MesFavoris";
import MesAvis from "./pages/MesAvis";

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cocktail/:nom" element={<CocktailDetail />} />
        <Route path="/compte" element={<Compte />} />
        <Route path="/compte/cocktails" element={<MesCocktails />} />
        <Route path="/compte/favoris" element={<MesFavoris />} />
        <Route path="/compte/avis" element={<MesAvis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
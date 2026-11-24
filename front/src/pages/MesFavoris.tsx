import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CarteRecette from "./CarteRecette";
import type { RecetteResume } from "./CarteRecette";
import { GlasseU } from "./Logo";
import "./myxo.css";
import { avecToken } from "../utils/api";
import { API_URL } from "../config";

interface Favori { cocktail: RecetteResume }

function MesFavoris() {
  const [favoris, setFavoris] = useState<Favori[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get(`${API_URL}/compte/mes-favoris`, avecToken())
      .then((res) => setFavoris(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const retirer = async (idcocktail: string) => {
    await axios.delete(`${API_URL}/compte/favori/${idcocktail}`, avecToken());
    setFavoris((liste) => (liste ?? []).filter((f) => f.cocktail.idcocktail !== idcocktail));
  };

  const n = favoris?.length ?? 0;

  return (
    <main className="page">
      <div className="fiche__retour">
        <button className="pill" onClick={() => navigate("/compte")}>← Retour</button>
      </div>

      <header className="espace-entete">
        <div>
          <p className="surtitre">Mon espace</p>
          <h1>Mes favoris</h1>
          {favoris && n > 0 && <p className="espace-entete__compte">{n} recette{n > 1 ? "s" : ""} gardée{n > 1 ? "s" : ""} sous le coude</p>}
        </div>
      </header>

      {favoris && n === 0 && (
        <div className="vide">
          <span className="vide__verre" aria-hidden="true"><GlasseU /></span>
          <div>
            <p className="vide__titre">Aucun favori.</p>
            <p>Ajoute des recettes à tes favoris depuis l'accueil ou leur fiche pour les retrouver ici.</p>
            <button className="pill pill--mangue" onClick={() => navigate("/")}>Découvrir les recettes</button>
          </div>
        </div>
      )}

      {n > 0 && (
        <ul className="recettes">
          {favoris!.map((f) => (
            <CarteRecette key={f.cocktail.idcocktail} c={f.cocktail}>
              <button className="pill pill--mangue" onClick={() => retirer(f.cocktail.idcocktail)}>Retirer</button>
            </CarteRecette>
          ))}
        </ul>
      )}
    </main>
  );
}

export default MesFavoris;

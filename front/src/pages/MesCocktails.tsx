import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CarteRecette from "./CarteRecette";
import type { RecetteResume } from "./CarteRecette";
import { GlasseY } from "./Logo";
import "./mycocktail.css";
import { avecToken } from "../utils/api";

function MesCocktails() {
  const [cocktails, setCocktails] = useState<RecetteResume[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/mes-cocktails", avecToken())
      .then((res) => setCocktails(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const supprimer = async (idcocktail: string) => {
    if (!confirm("Supprimer ce cocktail ?")) return;
    await axios.delete(`/api/cocktail/${idcocktail}`, avecToken());
    setCocktails((liste) => (liste ?? []).filter((c) => c.idcocktail !== idcocktail));
  };

  const n = cocktails?.length ?? 0;

  return (
    <main className="page">
      <div className="fiche__retour">
        <button className="pill" onClick={() => navigate("/compte")}>← Retour</button>
      </div>

      <header className="espace-entete">
        <div>
          <p className="surtitre">Mon espace</p>
          <h1>Mes cocktails</h1>
          {cocktails && n > 0 && <p className="espace-entete__compte">{n} création{n > 1 ? "s" : ""}, brouillons compris</p>}
        </div>
        <button className="pill pill--mangue" onClick={() => navigate("/cocktail/ajouter")}>Ajouter un cocktail</button>
      </header>

      {cocktails && n === 0 && (
        <div className="vide">
          <span className="vide__verre vide__verre--mangue" aria-hidden="true"><GlasseY /></span>
          <div>
            <p className="vide__titre">Aucun cocktail créé.</p>
            <p>Lance-toi : ta première recette peut rester en brouillon le temps de la peaufiner.</p>
          </div>
        </div>
      )}

      {n > 0 && (
        <ul className="recettes">
          {cocktails!.map((c) => (
            <CarteRecette key={c.idcocktail} c={c} avecStatut>
              <button className="pill" onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}/modifier`)}>Modifier</button>
              <button className="pill pill--danger" onClick={() => supprimer(c.idcocktail)}>Supprimer</button>
            </CarteRecette>
          ))}
        </ul>
      )}
    </main>
  );
}

export default MesCocktails;

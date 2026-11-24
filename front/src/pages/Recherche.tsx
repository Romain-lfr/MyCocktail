import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import CarteRecette from "./CarteRecette";
import type { RecetteResume } from "./CarteRecette";
import { GlasseU } from "./Logo";
import Avatar from "./Avatar";
import { tokenSiConnecte } from "../utils/api";
import "./myxo.css";
import { API_URL } from "../config";

interface Compte {
  idcompte: string;
  pseudo: string;
  dateinscription: string;
}

const moisAnnee = (d: string) => new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

function Recherche() {
  const [cocktails, setCocktails] = useState<RecetteResume[]>([]);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recherche = searchParams.get("q") || "";
  const [saisie, setSaisie] = useState(recherche);

  // La saisie suit l'URL (nouvelle recherche depuis le header)
  const [rechercheVue, setRechercheVue] = useState(recherche);
  if (recherche !== rechercheVue) {
    setRechercheVue(recherche);
    setSaisie(recherche);
  }

  useEffect(() => {
    if (!recherche) return;
    const token = localStorage.getItem("token");
    const estMineur = localStorage.getItem("estMineur") === "true";
    const url = token && !estMineur
      ? `${API_URL}/cocktail?recherche=${encodeURIComponent(recherche)}`
      : `${API_URL}/cocktail?alcool=false&recherche=${encodeURIComponent(recherche)}`;

    axios.get(url, tokenSiConnecte()).then((res) => {
      setCocktails(res.data);
    });

    axios.get(`${API_URL}/compte/recherche/${encodeURIComponent(recherche)}`)
      .then((res) => setComptes(res.data))
      .catch((err) => console.error("erreur comptes:", err));
  }, [recherche]);

  const relancer = (e: FormEvent) => {
    e.preventDefault();
    const terme = saisie.trim();
    if (terme) navigate(`/recherche?q=${encodeURIComponent(terme)}`);
  };

  const nbC = cocktails.length;
  const nbA = comptes.length;

  return (
    <main className="page">
      <header className="espace-entete recherche-entete">
        <div>
          <p className="surtitre">Recherche</p>
          <h1>{recherche ? <>Résultats pour « {recherche} »</> : "Rechercher"}</h1>
          {recherche && (
            <p className="espace-entete__compte">
              {nbC} cocktail{nbC > 1 ? "s" : ""} · {nbA} compte{nbA > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <form className="recherche-form" role="search" onSubmit={relancer}>
          <label className="sr-only" htmlFor="recherche-page">Nouvelle recherche</label>
          <input id="recherche-page" type="search" value={saisie} onChange={(e) => setSaisie(e.target.value)}
            placeholder="Un cocktail, un ingrédient, un pseudo…" />
          <button type="submit" className="pill pill--mangue">Chercher</button>
        </form>
      </header>

      <section className="recherche-bloc" aria-labelledby="titre-cocktails">
        <h2 id="titre-cocktails">Cocktails</h2>
        {nbC === 0 ? (
          <div className="vide">
            <span className="vide__verre" aria-hidden="true"><GlasseU /></span>
            <div>
              <p className="vide__titre">Aucun cocktail trouvé.</p>
              <p>Essaie un autre mot, ou pars de ce que tu as dans le frigo depuis l'accueil.</p>
              <button className="pill pill--mangue" onClick={() => navigate("/")}>Voir toutes les recettes</button>
            </div>
          </div>
        ) : (
          <ul className="recettes">
            {cocktails.map((c) => <CarteRecette key={c.idcocktail} c={c} />)}
          </ul>
        )}
      </section>

      <section className="recherche-bloc" aria-labelledby="titre-comptes">
        <h2 id="titre-comptes">Comptes</h2>
        {nbA === 0 ? (
          <p className="recherche-aucun">Aucun compte trouvé.</p>
        ) : (
          <ul className="comptes-trouves">
            {comptes.map((c) => (
              <li key={c.idcompte} className="compte-trouve">
                <Avatar className="compte-trouve__avatar" pseudo={c.pseudo} />
                <span>
                  <span className="compte-trouve__pseudo">{c.pseudo}</span>
                  <span className="compte-trouve__depuis">Membre depuis {moisAnnee(c.dateinscription)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Recherche;

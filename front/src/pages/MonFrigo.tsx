import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CarteRecette from "./CarteRecette";
import type { RecetteResume } from "./CarteRecette";
import { GlasseU } from "./Logo";
import "./mycocktail.css";
import { avecToken } from "../utils/api";
import { unitesPourCategorie } from "../utils/unites";
import { formatQuantite } from "../utils/format";

interface FrigoComposition {
  idingredient: string;
  quantite: number;
  unite: string;
  ingredient: { nomingredient: string; categorie: string };
}

function MonFrigo() {
  const [composition, setComposition] = useState<FrigoComposition[] | null>(null);
  const [cocktails, setCocktails] = useState<RecetteResume[] | null>(null);
  const [ingredients, setIngredients] = useState<{ idingredient: string; nomingredient: string; categorie: string }[]>([]);
  const [recherche, setRecherche] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editQuantite, setEditQuantite] = useState(0);
  const [editUnite, setEditUnite] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Relit le frigo et les cocktails réalisables (qui en dépendent) sans recharger la page
  const chargerFrigo = useCallback(() => Promise.all([
    axios.get("/api/compte/frigo", avecToken())
      .then((res) => setComposition(res.data.frigo_composition)),
    axios.get("/api/compte/frigo/cocktails", avecToken())
      .then((res) => setCocktails(res.data)),
  ]), []);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    chargerFrigo();
    axios.get("/api/cocktail/listes/ingredients")
      .then((res) => setIngredients(res.data));
  }, [token, navigate, chargerFrigo]);

  const handleAjouter = async (idingredient: string, categorie: string) => {
    const unite = unitesPourCategorie(categorie)[0];
    await axios.post(`/api/compte/frigo/${idingredient}`, {
      quantite: 1,
      unite,
    }, avecToken());
    setRecherche("");
    await chargerFrigo();
  };

  const handleModifier = async (idingredient: string) => {
    await axios.post(`/api/compte/frigo/${idingredient}`, {
      quantite: editQuantite,
      unite: editUnite,
    }, avecToken());
    setEditId(null);
    await chargerFrigo();
  };

  const handleSupprimer = async (idingredient: string) => {
    if (!confirm("Supprimer cet ingrédient du frigo ?")) return;
    await axios.delete(`/api/compte/frigo/${idingredient}`, avecToken());
    setComposition((liste) => (liste ?? []).filter((c) => c.idingredient !== idingredient));
    // Un cocktail peut ne plus être réalisable sans cet ingrédient
    axios.get("/api/compte/frigo/cocktails", avecToken())
      .then((res) => setCocktails(res.data));
  };

  const contenu = composition ?? [];
  const ingredientsFiltres = ingredients
    .filter((i) => i.nomingredient.toLowerCase().includes(recherche.toLowerCase()))
    .filter((i) => !contenu.find((c) => c.idingredient === i.idingredient))
    .slice(0, 8);

  const nbIng = contenu.length;
  const nbCocktails = cocktails?.length ?? 0;

  return (
    <main className="page">
      <div className="fiche__retour">
        <button className="pill" onClick={() => navigate("/compte")}>← Retour</button>
      </div>

      <header className="espace-entete">
        <div>
          <p className="surtitre">Mon espace</p>
          <h1>Mon frigo</h1>
          {composition && cocktails && (
            <p className="espace-entete__compte">
              {nbIng} ingrédient{nbIng > 1 ? "s" : ""} · {nbCocktails} cocktail{nbCocktails > 1 ? "s" : ""} réalisable{nbCocktails > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </header>

      <div className="monfrigo">
        <section className="monfrigo__contenu" aria-labelledby="titre-frigo">
          <h2 id="titre-frigo">Dans mon frigo</h2>

          <div className="selecteur__champ">
            <label className="sr-only" htmlFor="recherche-frigo">Ajouter un ingrédient au frigo</label>
            <input id="recherche-frigo" className="etape-form__recherche" placeholder="Ajouter un ingrédient…"
              value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            {recherche && (
              ingredientsFiltres.length > 0 ? (
                <ul className="suggestions">
                  {ingredientsFiltres.map((i) => (
                    <li key={i.idingredient}>
                      <button type="button" onClick={() => handleAjouter(i.idingredient, i.categorie)}>{i.nomingredient}</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="monfrigo__aucun">Aucun résultat</p>
              )
            )}
          </div>

          {composition && nbIng === 0 && (
            <p className="monfrigo__vide">Frigo vide ! Ajoute ce que tu as sous la main pour découvrir ce que tu peux préparer.</p>
          )}

          <ul className="dosages monfrigo__liste">
            {contenu.map((c) => {
              const nom = c.ingredient.nomingredient;
              return editId === c.idingredient ? (
                <li key={c.idingredient} className="monfrigo__edition">
                  <span className="dosages__nom">{nom}</span>
                  <input type="number" aria-label={`Quantité de ${nom}`} value={Number.isNaN(editQuantite) ? "" : editQuantite}
                    onChange={(e) => setEditQuantite(parseFloat(e.target.value))} />
                  <select aria-label={`Unité de ${nom}`} value={editUnite} onChange={(e) => setEditUnite(e.target.value)}>
                    {unitesPourCategorie(c.ingredient.categorie).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <span className="actions">
                    <button className="btn btn--plein" onClick={() => handleModifier(c.idingredient)}>Enregistrer</button>
                    <button className="btn" onClick={() => setEditId(null)}>Annuler</button>
                  </span>
                </li>
              ) : (
                <li key={c.idingredient}>
                  <span className="dosages__nom">{nom}</span>
                  <span className="dosages__trait" aria-hidden="true" />
                  <span className="dosages__qte">{formatQuantite(c.quantite)}<small>{c.unite}</small></span>
                  <button className="monfrigo__icone" aria-label={`Modifier ${nom}`}
                    onClick={() => { setEditId(c.idingredient); setEditQuantite(Number(c.quantite)); setEditUnite(c.unite); }}>✎</button>
                  <button className="monfrigo__icone monfrigo__icone--retirer" aria-label={`Retirer ${nom}`}
                    onClick={() => handleSupprimer(c.idingredient)}>×</button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="monfrigo__realisables" aria-labelledby="titre-realisables">
          <h2 id="titre-realisables">Ce que tu peux préparer</h2>
          {cocktails && nbCocktails === 0 && (
            <div className="vide">
              <span className="vide__verre" aria-hidden="true"><GlasseU /></span>
              <div>
                <p className="vide__titre">Aucun cocktail réalisable avec vos ingrédients.</p>
                <p>Il faut avoir <strong>tous</strong> les ingrédients d'une recette pour qu'elle apparaisse ici. Ajoute-en quelques-uns !</p>
              </div>
            </div>
          )}
          {nbCocktails > 0 && (
            <ul className="recettes monfrigo__recettes">
              {cocktails!.map((c) => <CarteRecette key={c.idcocktail} c={c} />)}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default MonFrigo;

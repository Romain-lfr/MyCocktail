import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface FrigoComposition {
  idingredient: string;
  quantite: number;
  unite: string;
  ingredient: { nomingredient: string; categorie: string };
}

interface Cocktail {
  idcocktail: string;
  nomcocktail: string;
  image: { urlimage: string }[];
  avis: { noteavis: number }[];
}

function MonFrigo() {
  const [composition, setComposition] = useState<FrigoComposition[]>([]);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [ingredients, setIngredients] = useState<{ idingredient: string; nomingredient: string; categorie: string }[]>([]);
  const [recherche, setRecherche] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editQuantite, setEditQuantite] = useState(0);
  const [editUnite, setEditUnite] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getUnites = (categorie: string): string[] => {
    switch (categorie) {
      case 'alcool': case 'jus': case 'sirop': case 'soda': case 'eau':
        return ['cl', 'ml', 'l'];
      case 'fruit': return ['pièce', 'tranche', 'g'];
      case 'autre': return ['morceau', 'feuille', 'pincée', 'g'];
      default: return ['cl', 'ml', 'l'];
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/frigo", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setComposition(res.data.frigo_composition));

    axios.get("/api/compte/frigo/cocktails", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCocktails(res.data));

    axios.get("/api/cocktail/listes/ingredients")
      .then((res) => setIngredients(res.data));
  }, []);

  const handleAjouter = async (idingredient: string, categorie: string) => {
    const unite = getUnites(categorie)[0];
    await axios.post(`/api/compte/frigo/${idingredient}`, {
      quantite: 1,
      unite,
    }, { headers: { Authorization: `Bearer ${token}` } });
    setRecherche("");
    window.location.reload();
  };

  const handleModifier = async (idingredient: string) => {
    await axios.post(`/api/compte/frigo/${idingredient}`, {
      quantite: editQuantite,
      unite: editUnite,
    }, { headers: { Authorization: `Bearer ${token}` } });
    setEditId(null);
    window.location.reload();
  };

  const handleSupprimer = async (idingredient: string) => {
    if (!confirm("Supprimer cet ingrédient du frigo ?")) return;
    await axios.delete(`/api/compte/frigo/${idingredient}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setComposition(composition.filter((c) => c.idingredient !== idingredient));
  };

  const ingredientsFiltres = ingredients
    .filter((i) => i.nomingredient.toLowerCase().includes(recherche.toLowerCase()))
    .filter((i) => !composition.find((c) => c.idingredient === i.idingredient));

  const getMoyenne = (c: Cocktail) =>
    c.avis.length ? c.avis.reduce((s, av) => s + av.noteavis, 0) / c.avis.length : 0;

  return (
    <div>
      <button onClick={() => navigate("/compte")}>← Retour</button>
      <h1>Mon frigo</h1>

      {/* Ajouter un ingrédient */}
      <h2>Ajouter un ingrédient</h2>
      <input
        placeholder="Rechercher un ingrédient..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />
      {recherche && (
        <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
          {ingredientsFiltres.length > 0 ? (
            ingredientsFiltres.map((i) => (
              <div
                key={i.idingredient}
                onClick={() => handleAjouter(i.idingredient, i.categorie)}
                style={{ padding: '8px', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                {i.nomingredient}
              </div>
            ))
          ) : (
            <p style={{ padding: '8px' }}>Aucun résultat</p>
          )}
        </div>
      )}

      {/* Liste des ingrédients */}
      <h2>Mes ingrédients</h2>
      {composition.length === 0 && <p>Frigo vide !</p>}
      {composition.map((c) => (
        <div key={c.idingredient} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0', borderRadius: '5px' }}>
          {editId === c.idingredient ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span>{c.ingredient.nomingredient}</span>
              <input
                type="number"
                value={editQuantite}
                onChange={(e) => setEditQuantite(parseFloat(e.target.value))}
                style={{ width: '80px' }}
              />
              <select value={editUnite} onChange={(e) => setEditUnite(e.target.value)}>
                {getUnites(c.ingredient.categorie).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button onClick={() => handleModifier(c.idingredient)}>Sauvegarder</button>
              <button onClick={() => setEditId(null)}>Annuler</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{c.ingredient.nomingredient} — {c.quantite} {c.unite}</span>
              <button onClick={() => { setEditId(c.idingredient); setEditQuantite(c.quantite); setEditUnite(c.unite); }}>Modifier</button>
              <button onClick={() => handleSupprimer(c.idingredient)} style={{ color: 'red' }}>Supprimer</button>
            </div>
          )}
        </div>
      ))}

      {/* Cocktails réalisables */}
      <h2>Cocktails réalisables avec mon frigo</h2>
      {cocktails.length === 0 && <p>Aucun cocktail réalisable avec vos ingrédients.</p>}
      {cocktails.map((c) => (
        <div key={c.idcocktail} onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {c.image && c.image[0] && <img src={`/api${c.image[0].urlimage}`} width={100} />}
          <p>{c.nomcocktail}</p>
          <p>{c.avis.length > 0 ? `${getMoyenne(c).toFixed(1)}/5 (${c.avis.length} avis)` : "Aucun avis"}</p>
        </div>
      ))}
    </div>
  );
}

export default MonFrigo;
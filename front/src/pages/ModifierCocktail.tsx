import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface Etape {
  idetape: string;
  numeroetape: number;
  descriptionetape: string;
  dosage: { idingredient: string; quantite: number; unite: string; ingredient: { nomingredient: string } }[];
  etape_ustensile: { idustensile: string; ustensile: { nomustensile: string } }[];
}

interface Ingredient {
  idingredient: string;
  nomingredient: string;
  categorie: string;
}

interface Ustensile {
  idustensile: string;
  nomustensile: string;
}

function ModifierCocktail() {
  const { nom } = useParams();
  const [nomcocktail, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [difficulte, setDifficulte] = useState("Facile");
  const [alcool, setAlcool] = useState(false);
  const [duree, setDuree] = useState(1);
  const [idcocktail, setIdcocktail] = useState("");
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ustensiles, setUstensiles] = useState<Ustensile[]>([]);
  const [rechercheIngredient, setRechercheIngredient] = useState("");
  const [rechercheUstensile, setRechercheUstensile] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setNom(res.data.nomcocktail);
      setDescription(res.data.description);
      setDifficulte(res.data.difficulte);
      setAlcool(res.data.alcool);
      setDuree(res.data.duree);
      setIdcocktail(res.data.idcocktail);
      setEtapes(res.data.etape || []);
    }).catch(() => navigate("/"));

    axios.get("/api/cocktail/listes/ingredients").then((res) => setIngredients(res.data));
    axios.get("/api/cocktail/listes/ustensiles").then((res) => setUstensiles(res.data));
  }, [nom]);

  const getUnites = (idingredient: string): string[] => {
    const ingredient = ingredients.find((i) => i.idingredient === idingredient);
    if (!ingredient) return ['cl', 'ml', 'l'];
    switch (ingredient.categorie) {
      case 'alcool': case 'jus': case 'sirop': case 'soda': case 'eau':
        return ['cl', 'ml', 'l'];
      case 'fruit': return ['pièce', 'tranche', 'g'];
      case 'autre': return ['morceau', 'feuille', 'pincée', 'g'];
      default: return ['cl', 'ml', 'l'];
    }
  };

  const handleSubmit = async () => {
    const err: Record<string, string> = {};
    if (nomcocktail.trim().length < 2) err.nom = "Le nom doit faire au moins 2 caractères";
    if (description.trim().length < 10) err.description = "La description doit faire au moins 10 caractères";
    if (duree < 1) err.duree = "La durée doit être positive";
    if (Object.keys(err).length > 0) { setErreurs(err); return; }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.put(`/api/cocktail/${idcocktail}`, {
        nomcocktail, description, difficulte, alcool, duree,
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/compte/cocktails");
    } catch (err: any) {
      setErreurs({ global: err.response?.data?.message || "Erreur lors de la modification" });
    }
  };

  const handleSupprimer = async () => {
    if (!confirm("Supprimer ce cocktail ?")) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      await axios.delete(`/api/cocktail/${idcocktail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch {
      setErreurs({ global: "Erreur lors de la suppression" });
    }
  };

  const ajouterEtape = async () => {
    const token = localStorage.getItem("token");
    const description = prompt("Description de la nouvelle étape :");
    if (!description || description.trim().length < 5) {
      alert("La description doit faire au moins 5 caractères");
      return;
    }

    try {
      const res = await axios.post(`/api/cocktail/${idcocktail}/etape`, {
        descriptionetape: description,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setEtapes([...etapes, {
        idetape: res.data.idetape,
        numeroetape: res.data.numeroetape,
        descriptionetape: res.data.descriptionetape,
        dosage: [],
        etape_ustensile: [],
      }]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout de l'étape");
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h1>Modifier {nom}</h1>

      <div>
        <label>Nom</label>
        <input value={nomcocktail} onChange={(e) => setNom(e.target.value)} />
        {erreurs.nom && <p style={{ color: 'red' }}>{erreurs.nom}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        {erreurs.description && <p style={{ color: 'red' }}>{erreurs.description}</p>}
      </div>

      <div>
        <label>Difficulté</label>
        <select value={difficulte} onChange={(e) => setDifficulte(e.target.value)}>
          <option value="Facile">Facile</option>
          <option value="Moyen">Moyen</option>
          <option value="Difficile">Difficile</option>
        </select>
      </div>

      <div>
        <label>Avec alcool ?</label>
        <input type="checkbox" checked={alcool} onChange={(e) => setAlcool(e.target.checked)} />
      </div>

      <div>
        <label>Durée (minutes)</label>
        <input type="number" value={duree} onChange={(e) => setDuree(parseInt(e.target.value))} min={1} />
        {erreurs.duree && <p style={{ color: 'red' }}>{erreurs.duree}</p>}
      </div>

      <button onClick={handleSubmit}>Sauvegarder</button>
      <button onClick={handleSupprimer} style={{ color: 'red', marginLeft: '10px' }}>Supprimer</button>
      {erreurs.global && <p style={{ color: 'red' }}>{erreurs.global}</p>}

      <button onClick={ajouterEtape}>+ Ajouter une étape</button> 

      <h2>Étapes</h2>
      {etapes.map((e, i) => (
        <div key={e.idetape} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
          <p>Étape {e.numeroetape}</p>
          <textarea
            value={e.descriptionetape}
            onChange={(ev) => {
              const copy = [...etapes];
              copy[i].descriptionetape = ev.target.value;
              setEtapes(copy);
            }}
            style={{ width: '100%' }}
          />
          <button onClick={async () => {
            const token = localStorage.getItem("token");
            await axios.put(`/api/cocktail/etape/${e.idetape}`, {
              descriptionetape: e.descriptionetape,
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Étape sauvegardée !");
          }}>Sauvegarder étape</button>
          <button onClick={async () => {
            if (!confirm("Supprimer cette étape ?")) return;
            const token = localStorage.getItem("token");
            await axios.delete(`/api/cocktail/etape/${e.idetape}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEtapes(etapes.filter((et) => et.idetape !== e.idetape));
          }} style={{ color: 'red', marginLeft: '10px' }}>Supprimer étape</button>

          <h4>Ingrédients</h4>
          {e.dosage.map((d, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '5px 0' }}>
              <span>{d.ingredient.nomingredient}</span>
              <input
                type="number"
                value={d.quantite || ""}
                onChange={(ev) => {
                  const copy = [...etapes];
                  copy[i].dosage[j].quantite = parseFloat(ev.target.value);
                  setEtapes(copy);
                }}
                style={{ width: '80px' }}
              />
              <select
                value={d.unite}
                onChange={(ev) => {
                  const copy = [...etapes];
                  copy[i].dosage[j].unite = ev.target.value;
                  setEtapes(copy);
                }}
              >
                {getUnites(d.idingredient).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button onClick={async () => {
                const token = localStorage.getItem("token");
                await axios.put(`/api/cocktail/${idcocktail}/dosage/${d.idingredient}`, {
                  quantite: d.quantite,
                  unite: d.unite,
                }, { headers: { Authorization: `Bearer ${token}` } });
                alert("Ingrédient sauvegardé !");
              }}>Sauvegarder</button>
            </div>
          ))}

          <input
            placeholder="Rechercher un ingrédient..."
            value={rechercheIngredient}
            onChange={(ev) => setRechercheIngredient(ev.target.value)}
          />
          {rechercheIngredient && (
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {ingredients
                .filter((ing) => ing.nomingredient.toLowerCase().includes(rechercheIngredient.toLowerCase()))
                .map((ing) => (
                  <div
                    key={ing.idingredient}
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await axios.post(`/api/cocktail/${idcocktail}/dosage`, {
                        idingredient: ing.idingredient,
                        quantite: 1,
                        unite: getUnites(ing.idingredient)[0],
                        idetape: e.idetape,
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      setRechercheIngredient("");
                      window.location.reload();
                    }}
                    style={{ padding: '8px', cursor: 'pointer' }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = '#f0f0f0')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'white')}
                  >
                    {ing.nomingredient}
                  </div>
                ))}
            </div>
          )}

          <h4>Ustensiles</h4>
          {e.etape_ustensile.map((u, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '5px 0' }}>
              <span>{u.ustensile.nomustensile}</span>
              <button onClick={async () => {
                const token = localStorage.getItem("token");
                await axios.delete(`/api/cocktail/etape/${e.idetape}/ustensile/${u.idustensile}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const copy = [...etapes];
                copy[i].etape_ustensile = copy[i].etape_ustensile.filter((_, k) => k !== j);
                setEtapes(copy);
              }} style={{ color: 'red' }}>Supprimer</button>
            </div>
          ))}

          <input
            placeholder="Rechercher un ustensile..."
            value={rechercheUstensile}
            onChange={(ev) => setRechercheUstensile(ev.target.value)}
          />
          {rechercheUstensile && (
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {ustensiles
                .filter((u) => u.nomustensile.toLowerCase().includes(rechercheUstensile.toLowerCase()))
                .map((u) => (
                  <div
                    key={u.idustensile}
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await axios.post(`/api/cocktail/etape/ustensile`, {
                        idetape: e.idetape,
                        idustensile: u.idustensile,
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      setRechercheUstensile("");
                      window.location.reload();
                    }}
                    style={{ padding: '8px', cursor: 'pointer' }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = '#f0f0f0')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'white')}
                  >
                    {u.nomustensile}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ModifierCocktail;
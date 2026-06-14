import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Ingredient {
  idingredient: string;
  nomingredient: string;
  categorie: string;
}

interface Ustensile {
  idustensile: string;
  nomustensile: string;
}

interface Etape {
  numeroetape: number;
  descriptionetape: string;
  ingredients: { idingredient: string; quantite: number; unite: string }[];
  ustensiles: { idustensile: string }[];
}

function AjouterCocktail() {
  const [etapeFormulaire, setEtapeFormulaire] = useState(1);
  const [nomcocktail, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [difficulte, setDifficulte] = useState("Facile");
  const [alcool, setAlcool] = useState(false);
  const [duree, setDuree] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [idcocktail, setIdcocktail] = useState("");
  const [recherches, setRecherches] = useState<{ ingredient: string; ustensile: string }[]>([]);

  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ustensiles, setUstensiles] = useState<Ustensile[]>([]);
  const [rechercheIngredient, setRechercheIngredient] = useState("");
  const [rechercheUstensile, setRechercheUstensile] = useState("");
  const [loading, setLoading] = useState(false);

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/cocktail/listes/ingredients")
      .then((res) => setIngredients(res.data));
    axios.get("/api/cocktail/listes/ustensiles")
      .then((res) => setUstensiles(res.data));
  }, []);

  const getUnites = (idingredient: string): string[] => {
    const ingredient = ingredients.find((i) => i.idingredient === idingredient);
    if (!ingredient) return ['cl', 'ml', 'l'];

    switch (ingredient.categorie) {
      case 'alcool':
      case 'jus':
      case 'sirop':
      case 'soda':
      case 'eau':
        return ['cl', 'ml', 'l'];
      case 'fruit':
        return ['pièce', 'tranche', 'g'];
      case 'autre':
        return ['morceau', 'feuille', 'pincée', 'g'];
      default:
        return ['cl', 'ml', 'l'];
    }
  };

  const ingredientsFiltres = (recherche: string) => ingredients.filter((ing) =>
    ing.nomingredient.toLowerCase().includes(recherche.toLowerCase())
  );

  const ustensilesFiltres = (recherche: string) => ustensiles.filter((u) =>
    u.nomustensile.toLowerCase().includes(recherche.toLowerCase())
  );

  const ajouterEtape = () => {
    setEtapes([...etapes, {
      numeroetape: etapes.length + 1,
      descriptionetape: "",
      ingredients: [],
      ustensiles: [],
    }]);
    setRecherches([...recherches, { ingredient: "", ustensile: "" }]);
  };

  const supprimerEtape = (index: number) => {
    const copy = etapes.filter((_, i) => i !== index);
    const recalcule = copy.map((e, i) => ({ ...e, numeroetape: i + 1 }));
    setEtapes(recalcule);
    setRecherches(recherches.filter((_, i) => i !== index));
  };

  const updateEtapeDesc = (index: number, desc: string) => {
    const copy = [...etapes];
    copy[index].descriptionetape = desc;
    setEtapes(copy);
  };

  const ajouterIngredientEtape = (index: number, idingredient?: string) => {
    const copy = [...etapes];
    const id = idingredient || ingredients[0]?.idingredient || "";
    const ing = ingredients.find((i) => i.idingredient === id);
    
    let unite = 'cl';
    if (ing?.categorie === 'fruit') unite = 'pièce';
    if (ing?.categorie === 'autre') unite = 'morceau';

    copy[index].ingredients.push({ idingredient: id, quantite: 1, unite });
    setEtapes(copy);
  };

  const updateIngredient = (etapeIndex: number, ingIndex: number, field: string, value: any) => {
    const copy = [...etapes];
    copy[etapeIndex].ingredients[ingIndex] = {
      ...copy[etapeIndex].ingredients[ingIndex],
      [field]: field === 'quantite' ? (isNaN(value) ? 0 : value) : value,
    };
    setEtapes(copy);
  };

  const supprimerIngredient = (etapeIndex: number, ingIndex: number) => {
    const copy = [...etapes];
    copy[etapeIndex].ingredients.splice(ingIndex, 1);
    setEtapes(copy);
  };

  const ajouterUstensileEtape = (index: number, idustensile?: string) => {
    const copy = [...etapes];
    copy[index].ustensiles.push({
      idustensile: idustensile || ustensiles[0]?.idustensile || "",
    });
    setEtapes(copy);
  };

  const supprimerUstensile = (etapeIndex: number, ustIndex: number) => {
    const copy = [...etapes];
    copy[etapeIndex].ustensiles.splice(ustIndex, 1);
    setEtapes(copy);
  };

  const validerInfos = () => {
    const err: Record<string, string> = {};
    if (nomcocktail.trim().length < 2) err.nom = "Le nom doit faire au moins 2 caractères";
    if (description.trim().length < 10) err.description = "La description doit faire au moins 10 caractères";
    if (duree < 1) err.duree = "La durée doit être positive";
    return err;
  };

  const handleInfosSubmit = async () => {
    const err = validerInfos();
    if (Object.keys(err).length > 0) { setErreurs(err); return; }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      const res = await axios.post("/api/cocktail", {
        nomcocktail, description, difficulte, alcool, duree,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setIdcocktail(res.data.idcocktail);

      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        await axios.post(`/api/cocktail/${res.data.idcocktail}/image`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }

      setEtapeFormulaire(2);
    } catch (err: any) {
      setErreurs({ global: err.response?.data?.message || "Erreur lors de l'ajout des étapes" });
      return;
    }
  };

  const handleEtapesSubmit = async () => {
    if (loading) return;
    const estMineur = localStorage.getItem("estMineur") === "true";
    for (const e of etapes) {
      if (e.descriptionetape.trim().length < 5) {
        setErreurs({ global: `L'étape ${e.numeroetape} doit avoir une description d'au moins 5 caractères` });
        return;
      }
      const ingredientsAlcool = e.ingredients.filter((ing) => {
        const ingredient = ingredients.find((i) => i.idingredient === ing.idingredient);
        return ingredient?.categorie === 'alcool';
      });
      if (estMineur && ingredientsAlcool.length > 0) {
        setErreurs({ global: `Impossible d'ajouter des ingrédients alcoolisés en tant que mineur` });
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      for (const e of etapes) {
        const etapeRes = await axios.post(`/api/cocktail/${idcocktail}/etape`, {
          numeroetape: e.numeroetape,
          descriptionetape: e.descriptionetape,
        }, { headers: { Authorization: `Bearer ${token}` } });

        const idetape = etapeRes.data.idetape;

        for (const ing of e.ingredients) {
          await axios.post(`/api/cocktail/${idcocktail}/dosage`, {
            idingredient: ing.idingredient,
            quantite: ing.quantite,
            unite: ing.unite,
            idetape,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }

        for (const ust of e.ustensiles) {
          await axios.post(`/api/cocktail/etape/ustensile`, {
            idetape,
            idustensile: ust.idustensile,
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
      }
      navigate(`/cocktail/${encodeURIComponent(nomcocktail)}`);
    } catch (err: any) {
      setErreurs({ global: err.response?.data?.message || "Erreur lors de l'ajout des étapes" });
    } finally {
      setLoading(false);
    }
  };

  if (etapeFormulaire === 1) return (
    <div>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h1>🍹 Ajouter un cocktail</h1>

      <div>
        <label>Nom</label>
        <input value={nomcocktail} onChange={(e) => setNom(e.target.value)} placeholder="Nom du cocktail" />
        {erreurs.nom && <p style={{ color: 'red' }}>{erreurs.nom}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
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

      <div>
        <label>Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </div>

      <button onClick={handleInfosSubmit}>Suivant → Ajouter les étapes</button>
      {erreurs.global && <p style={{ color: 'red' }}>{erreurs.global}</p>}
    </div>
  );

  return (
    <div>
      <h1>🍹 Étapes du cocktail</h1>

      {etapes.map((e, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Étape {e.numeroetape}</h3>
            <button onClick={() => supprimerEtape(i)} style={{ color: 'red' }}>🗑️ Supprimer l'étape</button>
          </div>

          <textarea
            value={e.descriptionetape}
            onChange={(ev) => updateEtapeDesc(i, ev.target.value)}
            placeholder="Description de l'étape"
            style={{ width: '100%' }}
          />

          <h4>Ingrédients</h4>
          <input
            placeholder="Rechercher un ingrédient..."
            value={recherches[i]?.ingredient || ""}
            onChange={(ev) => {
              const copy = [...recherches];
              copy[i] = { ...copy[i], ingredient: ev.target.value };
              setRecherches(copy);
            }}
          />
          {recherches[i]?.ingredient && (
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {ingredientsFiltres(recherches[i].ingredient).length > 0 ? (
                ingredientsFiltres(recherches[i].ingredient).map((ing) => (
                  <div key={ing.idingredient} onClick={() => {
                    ajouterIngredientEtape(i, ing.idingredient);
                    const copy = [...recherches];
                    copy[i] = { ...copy[i], ingredient: "" };
                    setRecherches(copy);
                  }}
                  style={{ padding: '8px', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}>
                    {ing.nomingredient}
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px' }}>
                  <p>Aucun résultat pour "{recherches[i].ingredient}"</p>
                  <select id={`nouvelle-categorie-${i}`} defaultValue="autre" style={{ marginRight: '5px' }}>
                    {['alcool', 'jus', 'sirop', 'soda', 'eau', 'fruit', 'autre'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button onClick={async () => {
                    const token = localStorage.getItem("token");
                    const categorie = (document.getElementById(`nouvelle-categorie-${i}`) as HTMLSelectElement).value;
                    const res = await axios.post('/api/cocktail/listes/ingredients', {
                      nomingredient: recherches[i].ingredient,
                      categorie,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    setIngredients([...ingredients, res.data]);
                    ajouterIngredientEtape(i, res.data.idingredient);
                    const copy = [...recherches];
                    copy[i] = { ...copy[i], ingredient: "" };
                    setRecherches(copy);
                  }}>+ Ajouter "{recherches[i].ingredient}"</button>
                </div>
              )}
            </div>
          )}
          {e.ingredients.map((ing, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', margin: '5px 0', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{ingredients.find(x => x.idingredient === ing.idingredient)?.nomingredient}</span>
              <input type="number" value={ing.quantite || ""} onChange={(ev) => updateIngredient(i, j, 'quantite', parseFloat(ev.target.value))} min={0.01} style={{ width: '80px' }} />
              <select 
                value={ing.unite} 
                onChange={(ev) => updateIngredient(i, j, 'unite', ev.target.value)}
                style={{ width: '80px' }}
              >
                {getUnites(ing.idingredient).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button onClick={() => supprimerIngredient(i, j)} style={{ color: 'red' }}>✕</button>
            </div>
          ))}

          <h4>Ustensiles</h4>
          <input
            placeholder="Rechercher un ustensile..."
            value={recherches[i]?.ustensile || ""}
            onChange={(ev) => {
              const copy = [...recherches];
              copy[i] = { ...copy[i], ustensile: ev.target.value };
              setRecherches(copy);
            }}
          />
          {recherches[i]?.ustensile && (
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
              {ustensilesFiltres(recherches[i].ustensile).length > 0 ? (
                ustensilesFiltres(recherches[i].ustensile).map((u) => (
                  <div key={u.idustensile} onClick={() => {
                    ajouterUstensileEtape(i, u.idustensile);
                    const copy = [...recherches];
                    copy[i] = { ...copy[i], ustensile: "" };
                    setRecherches(copy);
                  }}
                  style={{ padding: '8px', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}>
                    {u.nomustensile}
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px' }}>
                  <p>Aucun résultat pour "{recherches[i].ustensile}"</p>
                  <button onClick={async () => {
                    const token = localStorage.getItem("token");
                    const res = await axios.post('/api/cocktail/listes/ustensiles', {
                      nomustensile: recherches[i].ustensile,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    setUstensiles([...ustensiles, res.data]);
                    ajouterUstensileEtape(i, res.data.idustensile);
                    const copy = [...recherches];
                    copy[i] = { ...copy[i], ustensile: "" };
                    setRecherches(copy);
                  }}>+ Ajouter "{recherches[i].ustensile}"</button>
                </div>
              )}
            </div>
          )}
          {e.ustensiles.map((ust, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', margin: '5px 0', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{ustensiles.find(x => x.idustensile === ust.idustensile)?.nomustensile}</span>
              <button onClick={() => supprimerUstensile(i, j)} style={{ color: 'red' }}>✕</button>
            </div>
          ))}
        </div>
      ))}

      <button onClick={ajouterEtape}>+ Ajouter une étape</button>
      <br /><br />
      <button onClick={handleEtapesSubmit}>✅ Terminer</button>
      {erreurs.global && <p style={{ color: 'red' }}>{erreurs.global}</p>}
    </div>
  );
}

export default AjouterCocktail;
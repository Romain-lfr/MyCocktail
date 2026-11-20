import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GlasseY, GlasseU } from "./Logo";
import "./mycocktail.css";
import { avecToken, messageApi } from "../utils/api";
import { unitesPourCategorie } from "../utils/unites";
import { API_URL } from "../config";

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
  const [loading, setLoading] = useState(false);

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  // Catégorie choisie pour créer un ingrédient inconnu, par étape
  const [nouvelleCategorie, setNouvelleCategorie] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  // Aperçu de la photo choisie (URL locale, libérée au changement)
  const apercuImage = useMemo(
    () => (image && typeof URL.createObjectURL === "function" ? URL.createObjectURL(image) : null),
    [image],
  );
  useEffect(() => () => { if (apercuImage) URL.revokeObjectURL(apercuImage); }, [apercuImage]);
  // Photo déjà envoyée : évite de la renvoyer après « Précédent »
  const [imageEnvoyee, setImageEnvoyee] = useState<File | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/cocktail/listes/ingredients`)
      .then((res) => setIngredients(res.data));
    axios.get(`${API_URL}/cocktail/listes/ustensiles`)
      .then((res) => setUstensiles(res.data));
  }, []);

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

  // Modifie une étape sans jamais toucher à l'état en place : nouvelle liste, nouvelle étape, nouvelles sous-listes
  const modifierEtape = (index: number, changement: (e: Etape) => Etape) =>
    setEtapes((liste) => liste.map((e, i) => (i === index ? changement(e) : e)));

  const updateEtapeDesc = (index: number, desc: string) =>
    modifierEtape(index, (e) => ({ ...e, descriptionetape: desc }));

  // `categorie` est passée quand l'ingrédient vient d'être créé : il n'est pas encore dans `ingredients`
  const ajouterIngredientEtape = (index: number, idingredient?: string, categorie?: string) => {
    const id = idingredient || ingredients[0]?.idingredient || "";
    const unite = unitesPourCategorie(categorie ?? ingredients.find((i) => i.idingredient === id)?.categorie)[0];
    modifierEtape(index, (e) => ({ ...e, ingredients: [...e.ingredients, { idingredient: id, quantite: 1, unite }] }));
  };

  const updateIngredient = (etapeIndex: number, ingIndex: number, field: string, value: string | number) =>
    modifierEtape(etapeIndex, (e) => ({
      ...e,
      ingredients: e.ingredients.map((ing, j) => (j === ingIndex
        ? { ...ing, [field]: field === 'quantite' ? (Number.isNaN(value) ? 0 : value) : value }
        : ing)),
    }));

  const supprimerIngredient = (etapeIndex: number, ingIndex: number) =>
    modifierEtape(etapeIndex, (e) => ({ ...e, ingredients: e.ingredients.filter((_, j) => j !== ingIndex) }));

  const ajouterUstensileEtape = (index: number, idustensile?: string) =>
    modifierEtape(index, (e) => ({
      ...e,
      ustensiles: [...e.ustensiles, { idustensile: idustensile || ustensiles[0]?.idustensile || "" }],
    }));

  const supprimerUstensile = (etapeIndex: number, ustIndex: number) =>
    modifierEtape(etapeIndex, (e) => ({ ...e, ustensiles: e.ustensiles.filter((_, j) => j !== ustIndex) }));

  const validerInfos = () => {
    const err: Record<string, string> = {};
    if (nomcocktail.trim().length < 2) err.nom = "Le nom doit faire au moins 2 caractères";
    if (description.trim().length < 10) err.description = "La description doit faire au moins 10 caractères";
    if (!(duree >= 1)) err.duree = "La durée doit être positive"; // attrape aussi NaN (champ vidé)
    return err;
  };

  const handleInfosSubmit = async () => {
    const err = validerInfos();
    if (Object.keys(err).length > 0) { setErreurs(err); return; }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      const infos = { nomcocktail, description, difficulte, alcool, duree };
      const auth = avecToken();
      // Retour par « Précédent » : le cocktail existe déjà, on le met à jour au lieu d'en créer un second
      let id = idcocktail;
      if (id) {
        await axios.put(`${API_URL}/cocktail/${id}`, infos, auth);
      } else {
        const res = await axios.post(`${API_URL}/cocktail`, infos, auth);
        id = res.data.idcocktail;
        setIdcocktail(id);
      }

      if (image && image !== imageEnvoyee) {
        const formData = new FormData();
        formData.append("image", image);
        await axios.post(`${API_URL}/cocktail/${id}/image`, formData, {
          headers: { ...avecToken().headers, "Content-Type": "multipart/form-data" },
        });
        setImageEnvoyee(image);
      }

      setEtapeFormulaire(2);
    } catch (err: unknown) {
      setErreurs({ global: messageApi(err) || "Erreur lors de l'ajout des étapes" });
      return;
    }
  };

  /**
   * Enregistre les étapes puis :
   * - "brouillon" : reste en brouillon (le cocktail est créé ainsi) → Mes cocktails
   * - "priv_" / "publi_" : change le statut → fiche du cocktail
   */
  const handleEtapesSubmit = async (statut: "brouillon" | "priv_" | "publi_") => {
    if (loading) return;
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
        const etapeRes = await axios.post(`${API_URL}/cocktail/${idcocktail}/etape`, {
          numeroetape: e.numeroetape,
          descriptionetape: e.descriptionetape,
        }, avecToken());

        const idetape = etapeRes.data.idetape;

        for (const ing of e.ingredients) {
          await axios.post(`${API_URL}/cocktail/${idcocktail}/dosage`, {
            idingredient: ing.idingredient,
            quantite: ing.quantite,
            unite: ing.unite,
            idetape,
          }, avecToken());
        }

        for (const ust of e.ustensiles) {
          await axios.post(`${API_URL}/cocktail/etape/ustensile`, {
            idetape,
            idustensile: ust.idustensile,
          }, avecToken());
        }
      }
      if (statut === "brouillon") {
        navigate("/compte/cocktails");
        return;
      }
      await axios.put(`${API_URL}/cocktail/${idcocktail}`, { nomcocktail, description, difficulte, alcool, duree, statut },
        avecToken());
      navigate(`/cocktail/${encodeURIComponent(nomcocktail)}`);
    } catch (err: unknown) {
      setErreurs({ global: messageApi(err) || "Erreur lors de l'ajout des étapes" });
    } finally {
      setLoading(false);
    }
  };

  const estMineur = localStorage.getItem("estMineur") === "true";

  const setRecherche = (i: number, champ: "ingredient" | "ustensile", valeur: string) => {
    const copy = [...recherches];
    copy[i] = { ...copy[i], [champ]: valeur };
    setRecherches(copy);
  };

  const creerIngredient = async (i: number) => {
    const res = await axios.post(`${API_URL}/cocktail/listes/ingredients`, {
      nomingredient: recherches[i].ingredient,
      categorie: nouvelleCategorie[i] || "autre",
    }, avecToken());
    setIngredients([...ingredients, res.data]);
    ajouterIngredientEtape(i, res.data.idingredient, res.data.categorie);
    setRecherche(i, "ingredient", "");
  };

  const creerUstensile = async (i: number) => {
    const res = await axios.post(`${API_URL}/cocktail/listes/ustensiles`, {
      nomustensile: recherches[i].ustensile,
    }, avecToken());
    setUstensiles([...ustensiles, res.data]);
    ajouterUstensileEtape(i, res.data.idustensile);
    setRecherche(i, "ustensile", "");
  };

  // Champ invalide relié à son message d'erreur
  const etat = (champ: string) => ({
    "aria-invalid": !!erreurs[champ],
    "aria-describedby": erreurs[champ] ? `erreur-${champ}` : undefined,
  });
  const message = (champ: string) =>
    erreurs[champ] && <p id={`erreur-${champ}`} className="champ__erreur">{erreurs[champ]}</p>;

  const nomIngredient = (id: string) => ingredients.find((x) => x.idingredient === id)?.nomingredient ?? "";
  const nomUstensile = (id: string) => ustensiles.find((x) => x.idustensile === id)?.nomustensile ?? "";

  const progression = (
    <ol className="progression" aria-label="Progression">
      <li aria-current={etapeFormulaire === 1 ? "step" : undefined} className={etapeFormulaire > 1 ? "progression__faite" : ""}>
        <span aria-hidden="true">{etapeFormulaire > 1 ? "✓" : "1"}</span> Informations
      </li>
      <li aria-current={etapeFormulaire === 2 ? "step" : undefined}><span aria-hidden="true">2</span> Étapes</li>
    </ol>
  );

  if (etapeFormulaire === 1) return (
    <main className="page creation">
      <div className="fiche__retour">
        <button className="pill" onClick={() => navigate(-1)}>← Retour</button>
      </div>
      <p className="surtitre">Nouvelle recette</p>
      <h1>Ajouter un cocktail</h1>
      {progression}

      <div className="creation__grille">
      <form className="creation__form" noValidate onSubmit={(e) => { e.preventDefault(); handleInfosSubmit(); }}>
        <div className="connexion__champ">
          <label htmlFor="nom">Nom du cocktail</label>
          <input id="nom" value={nomcocktail} onChange={(e) => setNom(e.target.value)} {...etat("nom")} />
          {message("nom")}
        </div>

        <div className="connexion__champ">
          <label htmlFor="description">Description</label>
          <textarea id="description" className="creation__texte" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce qui le rend unique, son goût, l'occasion…" {...etat("description")} />
          {message("description")}
        </div>

        <div className="creation__ligne">
          <div className="connexion__champ">
            <span className="creation__label" id="label-difficulte">Difficulté</span>
            <div className="champ__pills" role="group" aria-labelledby="label-difficulte">
              {["Facile", "Moyen", "Difficile"].map((d) => (
                <button key={d} type="button" className={`pill pill--${d.toLowerCase()} ${difficulte === d ? "pill--active" : ""}`}
                  aria-pressed={difficulte === d} onClick={() => setDifficulte(d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className="connexion__champ">
            <span className="creation__label" id="label-alcool">Alcool</span>
            <div className="champ__pills" role="group" aria-labelledby="label-alcool">
              <button type="button" className={`pill ${!alcool ? "pill--active" : ""}`} aria-pressed={!alcool} onClick={() => setAlcool(false)}>Sans alcool</button>
              <button type="button" className={`pill ${alcool ? "pill--active" : ""}`} aria-pressed={alcool} onClick={() => setAlcool(true)}
                disabled={estMineur} aria-describedby={estMineur ? "aide-alcool" : undefined}>Avec alcool</button>
            </div>
            {estMineur && <p id="aide-alcool" className="connexion__aide">Réservé aux majeurs.</p>}
          </div>

          <div className="connexion__champ">
            <label htmlFor="duree">Durée</label>
            <div className="creation__duree">
              <input id="duree" type="number" value={duree} onChange={(e) => setDuree(parseInt(e.target.value))} min={1} {...etat("duree")} />
              <span aria-hidden="true">min</span>
            </div>
            {message("duree")}
          </div>
        </div>

        <div className="connexion__champ">
          <span className="creation__label">Photo <small>(facultative)</small></span>
          <label className="depot">
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} aria-label="Choisir une photo" />
            <span className="depot__texte">{image ? image.name : "Choisir une photo"}</span>
            <span className="depot__aide">{image ? "Cliquer pour en choisir une autre" : "JPG, PNG ou WebP"}</span>
          </label>
        </div>

        {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}

        <button type="submit" className="pill pill--mangue connexion__envoi">Suivant → Ajouter les étapes</button>
      </form>

      <aside className="apercu" aria-label="Aperçu de la carte">
        <p className="apercu__titre">Aperçu sur l'accueil</p>
        <div className="recette">
          <div className="recette__corps">
            <p className="recette__nom apercu__nom">{nomcocktail.trim() || "Nom du cocktail"}</p>
            <p className="recette__desc">{description.trim() || "La description apparaîtra ici."}</p>
            <div className="recette__meta">
              <span className={`statut statut--${difficulte}`}>{difficulte}</span>
              <span>{duree >= 1 ? duree : "–"} min</span>
              <span className={`tag ${alcool ? "tag--alcool" : ""}`}>{alcool ? "Alcool" : "Sans alcool"}</span>
            </div>
          </div>
          {apercuImage ? (
            <img className="recette__visuel" src={apercuImage} alt="Aperçu de la photo" />
          ) : (
            <div className={`recette__visuel recette__visuel--vide ${alcool ? "recette__visuel--alcool" : "recette__visuel--moktail"}`} aria-hidden="true">
              {alcool ? <GlasseY /> : <GlasseU />}
            </div>
          )}
        </div>
        <p className="apercu__aide">Ton cocktail restera en brouillon tant que tu ne le publies pas.</p>
      </aside>
      </div>
    </main>
  );

  return (
    <main className="page creation">
      <p className="surtitre">{nomcocktail}</p>
      <h1>Étapes du cocktail</h1>
      {progression}

      {etapes.length === 0 && (
        <p className="creation__vide">Décris la préparation étape par étape : ce qu'on verse, avec quoi, et dans quel ordre.</p>
      )}

      <ol className="etapes-form">
        {etapes.map((e, i) => (
          <li key={i} className="etape-form">
            <div className="etape-form__entete">
              <h3>Étape {e.numeroetape}</h3>
              <button type="button" className="btn btn--danger" onClick={() => supprimerEtape(i)}>Supprimer l'étape</button>
            </div>

            <label className="sr-only" htmlFor={`etape-${i}`}>Description de l'étape {e.numeroetape}</label>
            <textarea id={`etape-${i}`} className="creation__texte" value={e.descriptionetape}
              onChange={(ev) => updateEtapeDesc(i, ev.target.value)} placeholder="Ex. : Piler la menthe avec le sucre au fond du verre" />

            <div className="etape-form__colonnes">
              <div>
                <h4>Ingrédients</h4>
                <div className="selecteur__champ">
                  <input className="etape-form__recherche" aria-label={`Rechercher un ingrédient pour l'étape ${e.numeroetape}`} placeholder="Rechercher un ingrédient…"
                    value={recherches[i]?.ingredient || ""} onChange={(ev) => setRecherche(i, "ingredient", ev.target.value)} />
                  {recherches[i]?.ingredient && (
                    ingredientsFiltres(recherches[i].ingredient).length > 0 ? (
                      <ul className="suggestions">
                        {ingredientsFiltres(recherches[i].ingredient).map((ing) => (
                          <li key={ing.idingredient}>
                            <button type="button" onClick={() => { ajouterIngredientEtape(i, ing.idingredient); setRecherche(i, "ingredient", ""); }}>
                              {ing.nomingredient}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="nouveau">
                        <p>Aucun résultat pour « {recherches[i].ingredient} »</p>
                        <label htmlFor={`categorie-${i}`}>Catégorie</label>
                        <select id={`categorie-${i}`} value={nouvelleCategorie[i] || "autre"}
                          onChange={(ev) => setNouvelleCategorie({ ...nouvelleCategorie, [i]: ev.target.value })}>
                          {['alcool', 'jus', 'sirop', 'soda', 'eau', 'fruit', 'autre'].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button type="button" className="btn btn--plein" onClick={() => creerIngredient(i)}>+ Créer « {recherches[i].ingredient} »</button>
                      </div>
                    )
                  )}
                </div>

                <ul className="dosages-form">
                  {e.ingredients.map((ing, j) => {
                    const nom = nomIngredient(ing.idingredient);
                    return (
                      <li key={j}>
                        <span className="dosages-form__nom">{nom}</span>
                        <input type="number" aria-label={`Quantité de ${nom}`} value={ing.quantite || ""} min={0.01}
                          onChange={(ev) => updateIngredient(i, j, 'quantite', parseFloat(ev.target.value))} />
                        <select aria-label={`Unité de ${nom}`} value={ing.unite} onChange={(ev) => updateIngredient(i, j, 'unite', ev.target.value)}>
                          {unitesPourCategorie(ingredients.find((x) => x.idingredient === ing.idingredient)?.categorie).map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <button type="button" className="dosages-form__retirer" aria-label={`Retirer ${nom}`} onClick={() => supprimerIngredient(i, j)}>×</button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h4>Ustensiles</h4>
                <div className="selecteur__champ">
                  <input className="etape-form__recherche" aria-label={`Rechercher un ustensile pour l'étape ${e.numeroetape}`} placeholder="Rechercher un ustensile…"
                    value={recherches[i]?.ustensile || ""} onChange={(ev) => setRecherche(i, "ustensile", ev.target.value)} />
                  {recherches[i]?.ustensile && (
                    ustensilesFiltres(recherches[i].ustensile).length > 0 ? (
                      <ul className="suggestions">
                        {ustensilesFiltres(recherches[i].ustensile).map((u) => (
                          <li key={u.idustensile}>
                            <button type="button" onClick={() => { ajouterUstensileEtape(i, u.idustensile); setRecherche(i, "ustensile", ""); }}>
                              {u.nomustensile}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="nouveau">
                        <p>Aucun résultat pour « {recherches[i].ustensile} »</p>
                        <button type="button" className="btn btn--plein" onClick={() => creerUstensile(i)}>+ Créer « {recherches[i].ustensile} »</button>
                      </div>
                    )
                  )}
                </div>

                <div className="selecteur ustensiles-form">
                  {e.ustensiles.map((ust, j) => {
                    const nom = nomUstensile(ust.idustensile);
                    return (
                      <span key={j} className="puce">
                        {nom}
                        <button type="button" aria-label={`Retirer ${nom}`} onClick={() => supprimerUstensile(i, j)}>×</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button type="button" className="pill creation__ajouter" onClick={ajouterEtape}>+ Ajouter une étape</button>

      {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}

      <div className="creation__fin">
        <button type="button" className="pill" onClick={() => { setErreurs({}); setEtapeFormulaire(1); }} disabled={loading}>
          ← Précédent
        </button>
        <div className="creation__publier">
          <button type="button" className="pill" onClick={() => handleEtapesSubmit("brouillon")} disabled={loading}>
            Continuer plus tard
          </button>
          <button type="button" className="pill" onClick={() => handleEtapesSubmit("priv_")} disabled={loading || etapes.length === 0}
            aria-describedby={etapes.length === 0 ? "aide-publier" : undefined}>
            Publier en privé
          </button>
          <button type="button" className="pill pill--mangue creation__principal" onClick={() => handleEtapesSubmit("publi_")}
            disabled={loading || etapes.length === 0} aria-describedby={etapes.length === 0 ? "aide-publier" : undefined}>
            {loading ? "Enregistrement…" : "Publier"}
          </button>
        </div>
        {etapes.length === 0 && (
          <p id="aide-publier" className="creation__legende creation__legende--alerte">Ajoute au moins une étape pour pouvoir publier, même en privé.</p>
        )}
        <p className="creation__legende">
          <strong>Continuer plus tard</strong> garde ta recette en brouillon dans « Mes cocktails ».{" "}
          <strong>Publier en privé</strong> la garde pour toi seul·e. <strong>Publier</strong> la rend visible par tout le monde.
        </p>
      </div>
    </main>
  );
}

export default AjouterCocktail;

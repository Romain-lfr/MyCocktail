import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./mycocktail.css";
import { avecToken, messageApi } from "../utils/api";
import { unitesPourCategorie } from "../utils/unites";

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

// Valeurs du client Prisma : publi_ = publié, priv_ = privé, archiv_ = archivé
// Statuts « publiés » (public ou privé) : au moins une étape obligatoire
const STATUTS_PUBLIES = ["publi_", "priv_"];

const STATUTS = [
  { valeur: "brouillon", libelle: "Brouillon", aide: "Visible par toi seul·e, le temps de la peaufiner." },
  { valeur: "publi_", libelle: "Publié", aide: "Visible par tout le monde sur l'accueil." },
  { valeur: "priv_", libelle: "Privé", aide: "Terminé, mais gardé pour toi." },
  { valeur: "archiv_", libelle: "Archivé", aide: "Retiré de la circulation, sans être supprimé." },
];


function ModifierCocktail() {
  const { nom } = useParams();
  const [nomcocktail, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [difficulte, setDifficulte] = useState("Facile");
  const [alcool, setAlcool] = useState(false);
  const [duree, setDuree] = useState(1);
  const [statut, setStatut] = useState("brouillon");
  const [idcocktail, setIdcocktail] = useState("");
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ustensiles, setUstensiles] = useState<Ustensile[]>([]);
  // Une recherche par étape (clé = idetape), sinon taper dans une étape ouvre la liste dans toutes
  const [recherchesIngredient, setRecherchesIngredient] = useState<Record<string, string>>({});
  const [recherchesUstensile, setRecherchesUstensile] = useState<Record<string, string>>({});
  const [nouvelleCategorie, setNouvelleCategorie] = useState<Record<string, string>>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  // Nouvelle étape en cours de saisie (null = formulaire fermé)
  const [nouvelleEtape, setNouvelleEtape] = useState<string | null>(null);
  // Dernier élément enregistré, pour afficher « Enregistré ✓ » à côté
  const [enregistre, setEnregistre] = useState<string | null>(null);
  const navigate = useNavigate();
  const estMineur = localStorage.getItem("estMineur") === "true";

  const ingredientsFiltres = (recherche: string) => ingredients.filter((ing) =>
    ing.nomingredient.toLowerCase().includes(recherche.toLowerCase())
  );

  const ustensilesFiltres = (recherche: string) => ustensiles.filter((u) =>
    u.nomustensile.toLowerCase().includes(recherche.toLowerCase())
  );

  // Relit les ingrédients et ustensiles des étapes depuis l'API, sans toucher aux textes
  // pas encore enregistrés ni au reste du formulaire (remplace l'ancien rechargement de page)
  const rafraichirEtapes = async () => {
    const res = await axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, avecToken());
    const fraiches: Etape[] = res.data.etape || [];
    setEtapes((actuelles) => actuelles.map((e) => {
      const f = fraiches.find((x) => x.idetape === e.idetape);
      return f ? { ...e, dosage: f.dosage, etape_ustensile: f.etape_ustensile } : e;
    }));
  };

  const ajouterIngredientEtape = async (idetape: string, idingredient: string, unite: string) => {
    try {
      await axios.post(`/api/cocktail/${idcocktail}/dosage`, {
        idingredient,
        quantite: 1,
        unite,
        idetape,
      }, avecToken());
      setErreurs({});
      await rafraichirEtapes();
    } catch (err) {
      setErreurs({ [`etape-${idetape}`]: messageApi(err) || "Erreur lors de l'ajout de l'ingrédient" });
    }
  };

  const ajouterUstensileEtape = async (idetape: string, idustensile: string) => {
    await axios.post(`/api/cocktail/etape/ustensile`, { idetape, idustensile }, avecToken());
    await rafraichirEtapes();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, avecToken()).then((res) => {
      setNom(res.data.nomcocktail);
      setDescription(res.data.description);
      setDifficulte(res.data.difficulte);
      setAlcool(res.data.alcool);
      setDuree(res.data.duree);
      setStatut(res.data.statut);
      setIdcocktail(res.data.idcocktail);
      setEtapes(res.data.etape || []);
    }).catch(() => navigate("/"));

    axios.get("/api/cocktail/listes/ingredients").then((res) => setIngredients(res.data));
    axios.get("/api/cocktail/listes/ustensiles").then((res) => setUstensiles(res.data));
  }, [nom, navigate]);

  const handleSubmit = async () => {
    const err: Record<string, string> = {};
    if (nomcocktail.trim().length < 2) err.nom = "Le nom doit faire au moins 2 caractères";
    if (description.trim().length < 10) err.description = "La description doit faire au moins 10 caractères";
    if (!(duree >= 1)) err.duree = "La durée doit être positive"; // attrape aussi NaN (champ vidé)
    if (STATUTS_PUBLIES.includes(statut) && etapes.length === 0) err.global = "Ajoute au moins une étape avant de publier le cocktail";
    setErreurs(err);
    if (Object.keys(err).length > 0) return;

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.put(`/api/cocktail/${idcocktail}`, {
        nomcocktail, description, difficulte, alcool, duree, statut,
      }, avecToken());
      navigate("/compte/cocktails");
    } catch (err) {
      setErreurs({ global: messageApi(err) || "Erreur lors de la modification" });
    }
  };

  const handleSupprimer = async () => {
    if (!confirm("Supprimer ce cocktail ?")) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      await axios.delete(`/api/cocktail/${idcocktail}`, avecToken());
      navigate("/");
    } catch {
      setErreurs({ global: "Erreur lors de la suppression" });
    }
  };

  const ajouterEtape = async () => {
    const texte = (nouvelleEtape ?? "").trim();
    if (texte.length < 5) {
      setErreurs({ nouvelleEtape: "La description doit faire au moins 5 caractères" });
      return;
    }

    try {
      const res = await axios.post(`/api/cocktail/${idcocktail}/etape`, { descriptionetape: texte }, avecToken());
      setEtapes([...etapes, {
        idetape: res.data.idetape,
        numeroetape: res.data.numeroetape,
        descriptionetape: res.data.descriptionetape,
        dosage: [],
        etape_ustensile: [],
      }]);
      setNouvelleEtape(null);
      setErreurs({});
    } catch (err) {
      setErreurs({ nouvelleEtape: messageApi(err) || "Erreur lors de l'ajout de l'étape" });
    }
  };

  const sauvegarderEtape = async (e: Etape) => {
    await axios.put(`/api/cocktail/etape/${e.idetape}`, { descriptionetape: e.descriptionetape }, avecToken());
    setEnregistre(e.idetape);
  };

  const supprimerEtape = async (e: Etape) => {
    if (!confirm("Supprimer cette étape ?")) return;
    try {
      await axios.delete(`/api/cocktail/etape/${e.idetape}`, avecToken());
      setEtapes(etapes.filter((et) => et.idetape !== e.idetape));
    } catch (err) {
      // ex. 409 : dernière étape d'un cocktail publié
      setErreurs({ [`etape-${e.idetape}`]: messageApi(err) || "Erreur lors de la suppression de l'étape" });
    }
  };

  const sauvegarderDosage = async (idetape: string, d: Etape["dosage"][number]) => {
    await axios.put(`/api/cocktail/${idcocktail}/dosage/${d.idingredient}`, { quantite: Number(d.quantite), unite: d.unite }, avecToken());
    setEnregistre(`${idetape}-${d.idingredient}`);
  };

  const retirerIngredient = async (i: number, idetape: string, d: Etape["dosage"][number]) => {
    if (!confirm(`Retirer ${d.ingredient.nomingredient} de la recette ?`)) return;
    try {
      await axios.delete(`/api/cocktail/${idcocktail}/dosage/${d.idingredient}`, avecToken());
      const copy = [...etapes];
      copy[i] = { ...copy[i], dosage: copy[i].dosage.filter((x) => x.idingredient !== d.idingredient) };
      setEtapes(copy);
    } catch (err) {
      setErreurs({ [`etape-${idetape}`]: messageApi(err) || "Erreur lors du retrait de l'ingrédient" });
    }
  };

  const retirerUstensile = async (i: number, idetape: string, idustensile: string) => {
    await axios.delete(`/api/cocktail/etape/${idetape}/ustensile/${idustensile}`, avecToken());
    const copy = [...etapes];
    copy[i] = { ...copy[i], etape_ustensile: copy[i].etape_ustensile.filter((u) => u.idustensile !== idustensile) };
    setEtapes(copy);
  };

  const creerIngredient = async (idetape: string, nomingredient: string) => {
    const res = await axios.post('/api/cocktail/listes/ingredients', {
      nomingredient,
      categorie: nouvelleCategorie[idetape] || "autre",
    }, avecToken());
    setIngredients([...ingredients, res.data]);
    ajouterIngredientEtape(idetape, res.data.idingredient, unitesPourCategorie(res.data.categorie)[0]);
  };

  const creerUstensile = async (idetape: string, nomustensile: string) => {
    const res = await axios.post('/api/cocktail/listes/ustensiles', { nomustensile }, avecToken());
    setUstensiles([...ustensiles, res.data]);
    ajouterUstensileEtape(idetape, res.data.idustensile);
  };

  // Champ invalide relié à son message d'erreur
  const etat = (champ: string) => ({
    "aria-invalid": !!erreurs[champ],
    "aria-describedby": erreurs[champ] ? `erreur-${champ}` : undefined,
  });
  const message = (champ: string) =>
    erreurs[champ] && <p id={`erreur-${champ}`} className="champ__erreur">{erreurs[champ]}</p>;
  const confirmation = (cle: string) =>
    enregistre === cle && <span className="enregistre" role="status">Enregistré ✓</span>;

  const statutChoisi = STATUTS.find((s) => s.valeur === statut);

  return (
    <main className="page creation">
      <div className="fiche__retour">
        <button className="pill" onClick={() => navigate(-1)}>← Retour</button>
      </div>
      <p className="surtitre">Modifier la recette</p>
      <h1>{nom}</h1>

      <div className="creation__grille modification">
        <div className="creation__form">
          <div className="connexion__champ">
            <label htmlFor="nom">Nom du cocktail</label>
            <input id="nom" value={nomcocktail} onChange={(e) => setNom(e.target.value)} {...etat("nom")} />
            {message("nom")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="description">Description</label>
            <textarea id="description" className="creation__texte" value={description}
              onChange={(e) => setDescription(e.target.value)} {...etat("description")} />
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
                <input id="duree" type="number" value={Number.isNaN(duree) ? "" : duree} onChange={(e) => setDuree(parseInt(e.target.value))} min={1} {...etat("duree")} />
                <span aria-hidden="true">min</span>
              </div>
              {message("duree")}
            </div>
          </div>
        </div>

        <aside className="apercu publication" aria-label="Publication">
          <p className="apercu__titre" id="label-statut">Statut</p>
          <div className="statuts" role="group" aria-labelledby="label-statut">
            {STATUTS.map((s) => {
              // Sans étape, on ne peut pas choisir un statut publié (sauf s'il l'est déjà, pour pouvoir en sortir)
              const bloque = etapes.length === 0 && STATUTS_PUBLIES.includes(s.valeur) && statut !== s.valeur;
              return (
                <button key={s.valeur} type="button" className={`pill ${statut === s.valeur ? "pill--active" : ""}`}
                  aria-pressed={statut === s.valeur} onClick={() => setStatut(s.valeur)}
                  disabled={bloque} aria-describedby={bloque ? "aide-statut" : undefined}>{s.libelle}</button>
              );
            })}
          </div>
          {etapes.length === 0 && (
            <p id="aide-statut" className="publication__aide publication__aide--alerte">Ajoute au moins une étape pour publier, même en privé.</p>
          )}
          {statutChoisi && <p className="publication__aide">{statutChoisi.aide}</p>}

          {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}
          <button type="button" className="pill pill--mangue connexion__envoi" onClick={handleSubmit}>Enregistrer les modifications</button>

          <div className="publication__danger">
            <button type="button" className="pill pill--danger" onClick={handleSupprimer}>Supprimer le cocktail</button>
          </div>
        </aside>
      </div>

      <section className="modification__etapes" aria-labelledby="titre-etapes">
        <h2 id="titre-etapes">Étapes</h2>
        <p className="creation__vide">Chaque modification d'étape s'enregistre avec son propre bouton.</p>

        <ol className="etapes-form">
          {etapes.map((e, i) => {
            const rechercheIngredient = recherchesIngredient[e.idetape] || "";
            const rechercheUstensile = recherchesUstensile[e.idetape] || "";
            const setRechercheIngredient = (v: string) => setRecherchesIngredient({ ...recherchesIngredient, [e.idetape]: v });
            const setRechercheUstensile = (v: string) => setRecherchesUstensile({ ...recherchesUstensile, [e.idetape]: v });
            return (
              <li key={e.idetape} className="etape-form" aria-label={`Étape ${e.numeroetape}`}>
                <div className="etape-form__entete">
                  <h3>Étape {e.numeroetape}</h3>
                  <button type="button" className="btn btn--danger" onClick={() => supprimerEtape(e)}>Supprimer l'étape</button>
                </div>

                <label className="sr-only" htmlFor={`etape-${e.idetape}`}>Description de l'étape {e.numeroetape}</label>
                <textarea id={`etape-${e.idetape}`} className="creation__texte" value={e.descriptionetape}
                  onChange={(ev) => {
                    const copy = [...etapes];
                    copy[i] = { ...copy[i], descriptionetape: ev.target.value };
                    setEtapes(copy);
                  }} />
                <div className="actions">
                  <button type="button" className="btn btn--plein" onClick={() => sauvegarderEtape(e)}>Enregistrer l'étape</button>
                  {confirmation(e.idetape)}
                </div>

                {erreurs[`etape-${e.idetape}`] && <p role="alert" className="connexion__erreur">{erreurs[`etape-${e.idetape}`]}</p>}

                <div className="etape-form__colonnes">
                  <div>
                    <h4>Ingrédients</h4>
                    <ul className="dosages-form">
                      {e.dosage.map((d, j) => (
                        <li key={d.idingredient}>
                          <span className="dosages-form__nom">{d.ingredient.nomingredient}</span>
                          <input type="number" aria-label={`Quantité de ${d.ingredient.nomingredient}`} value={d.quantite || ""}
                            onChange={(ev) => {
                              const copy = [...etapes];
                              // copie de l'étape ET de sa liste de dosages : ne jamais modifier l'état en place
                              copy[i] = { ...copy[i], dosage: copy[i].dosage.map((x, k) => (k === j ? { ...x, quantite: parseFloat(ev.target.value) } : x)) };
                              setEtapes(copy);
                            }} />
                          <select aria-label={`Unité de ${d.ingredient.nomingredient}`} value={d.unite}
                            onChange={(ev) => {
                              const copy = [...etapes];
                              // copie de l'étape ET de sa liste de dosages : ne jamais modifier l'état en place
                              copy[i] = { ...copy[i], dosage: copy[i].dosage.map((x, k) => (k === j ? { ...x, unite: ev.target.value } : x)) };
                              setEtapes(copy);
                            }}>
                            {unitesPourCategorie(ingredients.find((x) => x.idingredient === d.idingredient)?.categorie).map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <button type="button" className="btn" aria-label={`Enregistrer ${d.ingredient.nomingredient}`}
                            onClick={() => sauvegarderDosage(e.idetape, d)}>Enregistrer</button>
                          <button type="button" className="dosages-form__retirer" aria-label={`Retirer ${d.ingredient.nomingredient}`}
                            onClick={() => retirerIngredient(i, e.idetape, d)}>×</button>
                          {confirmation(`${e.idetape}-${d.idingredient}`)}
                        </li>
                      ))}
                    </ul>

                    <div className="selecteur__champ">
                      <input className="etape-form__recherche" aria-label={`Rechercher un ingrédient pour l'étape ${e.numeroetape}`}
                        placeholder="Ajouter un ingrédient…" value={rechercheIngredient} onChange={(ev) => setRechercheIngredient(ev.target.value)} />
                      {rechercheIngredient && (
                        ingredientsFiltres(rechercheIngredient).length > 0 ? (
                          <ul className="suggestions">
                            {ingredientsFiltres(rechercheIngredient).map((ing) => (
                              <li key={ing.idingredient}>
                                <button type="button" onClick={() => {
                                  ajouterIngredientEtape(e.idetape, ing.idingredient, unitesPourCategorie(ing.categorie)[0]);
                                  setRechercheIngredient("");
                                }}>{ing.nomingredient}</button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="nouveau">
                            <p>Aucun résultat pour « {rechercheIngredient} »</p>
                            <label htmlFor={`categorie-${e.idetape}`}>Catégorie</label>
                            <select id={`categorie-${e.idetape}`} value={nouvelleCategorie[e.idetape] || "autre"}
                              onChange={(ev) => setNouvelleCategorie({ ...nouvelleCategorie, [e.idetape]: ev.target.value })}>
                              {['alcool', 'jus', 'sirop', 'soda', 'eau', 'fruit', 'autre'].map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <button type="button" className="btn btn--plein" onClick={() => {
                              creerIngredient(e.idetape, rechercheIngredient);
                              setRechercheIngredient("");
                            }}>+ Créer « {rechercheIngredient} »</button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4>Ustensiles</h4>
                    <div className="selecteur ustensiles-form">
                      {e.etape_ustensile.map((u) => (
                        <span key={u.idustensile} className="puce">
                          {u.ustensile.nomustensile}
                          <button type="button" aria-label={`Retirer ${u.ustensile.nomustensile}`}
                            onClick={() => retirerUstensile(i, e.idetape, u.idustensile)}>×</button>
                        </span>
                      ))}
                    </div>

                    <div className="selecteur__champ ustensiles-form">
                      <input className="etape-form__recherche" aria-label={`Rechercher un ustensile pour l'étape ${e.numeroetape}`}
                        placeholder="Ajouter un ustensile…" value={rechercheUstensile} onChange={(ev) => setRechercheUstensile(ev.target.value)} />
                      {rechercheUstensile && (
                        ustensilesFiltres(rechercheUstensile).length > 0 ? (
                          <ul className="suggestions">
                            {ustensilesFiltres(rechercheUstensile).map((u) => (
                              <li key={u.idustensile}>
                                <button type="button" onClick={() => {
                                  ajouterUstensileEtape(e.idetape, u.idustensile);
                                  setRechercheUstensile("");
                                }}>{u.nomustensile}</button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="nouveau">
                            <p>Aucun résultat pour « {rechercheUstensile} »</p>
                            <button type="button" className="btn btn--plein" onClick={() => {
                              creerUstensile(e.idetape, rechercheUstensile);
                              setRechercheUstensile("");
                            }}>+ Créer « {rechercheUstensile} »</button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {nouvelleEtape === null ? (
          <button type="button" className="pill creation__ajouter" onClick={() => { setNouvelleEtape(""); setErreurs({}); }}>
            + Ajouter une étape
          </button>
        ) : (
          <div className="etape-form nouvelle-etape">
            <h3>Étape {etapes.length + 1}</h3>
            <label className="sr-only" htmlFor="nouvelle-etape">Description de la nouvelle étape</label>
            <textarea id="nouvelle-etape" className="creation__texte" value={nouvelleEtape} autoFocus
              placeholder="Ex. : Servir bien frais avec une feuille de menthe"
              onChange={(ev) => setNouvelleEtape(ev.target.value)} {...etat("nouvelleEtape")} />
            {message("nouvelleEtape")}
            <div className="actions">
              <button type="button" className="btn btn--plein" onClick={ajouterEtape}>Ajouter l'étape</button>
              <button type="button" className="btn" onClick={() => { setNouvelleEtape(null); setErreurs({}); }}>Annuler</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default ModifierCocktail;

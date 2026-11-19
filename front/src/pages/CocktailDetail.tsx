import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GlasseY, GlasseU } from "./Logo";
import { idCompteDuToken } from "../utils/token";
import "./mycocktail.css";
import { avecToken, tokenSiConnecte } from "../utils/api";
import { formatNote, formatQuantite, noteMoyenne } from "../utils/format";

interface Reponse {
  idreponse: string;
  idcompte: string;
  commentaire: string;
  datereponse: string;
  idreponse_parent: string | null;
  compte: { pseudo: string };
}

interface Avis {
  idavis: string;
  idcompte: string;
  noteavis: number;
  titreavis: string;
  descriptionavis: string;
  dateavis: string;
  compte: { pseudo: string };
  reponse: Reponse[];
}

interface Dosage {
  idingredient: string;
  quantite: number;
  unite: string;
  ingredient: { nomingredient: string };
}

interface Cocktail {
  idcocktail: string;
  nomcocktail: string;
  description: string;
  difficulte: string;
  alcool: boolean;
  duree: number;
  idcompte: string;
  image: { urlimage: string; titleimage: string }[];
  etape: {
    idetape: string;
    numeroetape: number;
    descriptionetape: string;
    etape_ustensile: { ustensile: { nomustensile: string } }[];
    dosage: Dosage[];
  }[];
  dosage: Dosage[];
  avis: Avis[];
}

// « Feuilles de menthe (6 feuilles) » : évite « 6 feuilles Feuilles de menthe »
const formatDosage = (d: Dosage) => `${d.ingredient.nomingredient} (${formatQuantite(d.quantite)} ${d.unite})`;

function CocktailDetail() {
  const { nom } = useParams();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const navigate = useNavigate();
  const [isFavori, setIsFavori] = useState(false);
  const token = localStorage.getItem("token");
  const userIdcompte = idCompteDuToken(token);
  const [introuvable, setIntrouvable] = useState(false);
  const auth = avecToken();

  const [editAvisId, setEditAvisId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState(5);
  const [editTitre, setEditTitre] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [reponseAvisId, setReponseAvisId] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [reponseParentId, setReponseParentId] = useState<string | null>(null);
  const [editReponseId, setEditReponseId] = useState<string | null>(null);
  const [editCommentaire, setEditCommentaire] = useState("");
  // Étapes cochées pendant la préparation (local, non enregistré)
  const [faites, setFaites] = useState<string[]>([]);
  const basculerEtape = (id: string) =>
    setFaites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  // (Re)charge la fiche : au montage, puis après chaque action sur les avis, sans recharger toute la page
  const charger = useCallback(() =>
    axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, tokenSiConnecte())
      .then((res) => {
        if (res.data) setCocktail(res.data);
        else setIntrouvable(true);
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        else setIntrouvable(true);
      }), [nom, token, navigate]);

  const handleSauvegarderAvis = async () => {
    await axios.put(`/api/avis/${editAvisId}`, {
      noteavis: editNote,
      titreavis: editTitre,
      descriptionavis: editDescription,
    }, auth);
    setEditAvisId(null);
    await charger();
  };

  const handleSupprimerAvis = async (idavis: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await axios.delete(`/api/avis/${idavis}`, auth);
    await charger();
  };

  const sauvegarderReponse = async (idreponse: string) => {
    await axios.put(`/api/avis/reponse/${idreponse}`, { commentaire: editCommentaire }, auth);
    setEditReponseId(null);
    await charger();
  };

  const supprimerReponse = async (idreponse: string) => {
    if (!confirm("Supprimer cette réponse ?")) return;
    await axios.delete(`/api/avis/reponse/${idreponse}`, auth);
    await charger();
  };

  const envoyerReponse = async (idavis: string, parent: string | null) => {
    if (commentaire.trim().length < 2) return;
    await axios.post(`/api/avis/${idavis}/reponse`,
      parent ? { commentaire, idreponse_parent: parent } : { commentaire }, auth);
    setReponseAvisId(null);
    setReponseParentId(null);
    setCommentaire("");
    await charger();
  };

  const annulerReponse = () => {
    setReponseAvisId(null);
    setReponseParentId(null);
    setCommentaire("");
  };

  useEffect(() => {
    if (!token || !cocktail) return;
    axios.get(`/api/compte/favori/${cocktail.idcocktail}`, auth)
      .then((res) => setIsFavori(res.data.isFavori));
  }, [cocktail?.idcocktail]);

  const toggleFavori = async () => {
    if (!token) { navigate("/login"); return; }
    if (isFavori) {
      await axios.delete(`/api/compte/favori/${cocktail!.idcocktail}`, auth);
      setIsFavori(false);
    } else {
      await axios.post(`/api/compte/favori/${cocktail!.idcocktail}`, {}, auth);
      setIsFavori(true);
    }
  };

  useEffect(() => { charger(); }, [charger]);

  if (!cocktail) {
    return (
      <>
        <main className="page"><p className="vide">{introuvable ? "Cocktail introuvable." : "Chargement…"}</p></main>
      </>
    );
  }

  const ustensiles = Array.from(new Set(
    cocktail.etape.flatMap((e) => e.etape_ustensile.map((u) => u.ustensile.nomustensile))
  ));

  const moyenneTexte = formatNote(noteMoyenne(cocktail.avis));
  // Le compte connecté est l'auteur : il ne peut pas noter sa propre recette (refusé aussi par l'API)
  const estAuteur = !!userIdcompte && userIdcompte === cocktail.idcompte;

  const formReponse = (a: Avis, parent: string | null) => (
    <div className="form-inline">
      <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Votre réponse…" aria-label="Votre réponse" />
      <div className="actions">
        <button className="btn btn--plein" onClick={() => envoyerReponse(a.idavis, parent)}>Envoyer</button>
        <button className="btn" onClick={annulerReponse}>Annuler</button>
      </div>
    </div>
  );

  const blocReponse = (r: Reponse, a: Avis, peutRepondre: boolean) => (
    editReponseId === r.idreponse ? (
      <div className="form-inline">
        <textarea value={editCommentaire} onChange={(e) => setEditCommentaire(e.target.value)} aria-label="Modifier la réponse" />
        <div className="actions">
          <button className="btn btn--plein" onClick={() => sauvegarderReponse(r.idreponse)}>Sauvegarder</button>
          <button className="btn" onClick={() => setEditReponseId(null)}>Annuler</button>
        </div>
      </div>
    ) : (
      <>
        <p>{r.commentaire}</p>
        <p className="avis__auteur">
          {r.compte.pseudo}
          {r.idcompte === cocktail.idcompte && <span className="badge-auteur">Auteur de la recette</span>}
        </p>
        <div className="actions">
          {peutRepondre && token && userIdcompte !== r.idcompte && (
            <button className="btn" onClick={() => { setReponseAvisId(a.idavis); setReponseParentId(r.idreponse); setCommentaire(""); }}>Répondre</button>
          )}
          {userIdcompte === r.idcompte && (
            <>
              <button className="btn" onClick={() => { setEditReponseId(r.idreponse); setEditCommentaire(r.commentaire); }}>Modifier</button>
              <button className="btn btn--danger" onClick={() => supprimerReponse(r.idreponse)}>Supprimer</button>
            </>
          )}
        </div>
      </>
    )
  );

  return (
    <>
      <main className="page fiche">
        <div className="fiche__retour">
          <button className="pill" onClick={() => navigate(-1)}>← Retour</button>
        </div>

        <section className="fiche__entete">
          <div>
            <h1>{cocktail.nomcocktail}</h1>
            <div className="fiche__meta">
              <span className={`statut statut--${cocktail.difficulte}`}>{cocktail.difficulte}</span>
              <span>{cocktail.duree} min</span>
              <span>{cocktail.avis.length > 0 ? `${moyenneTexte}/5 (${cocktail.avis.length} avis)` : "Aucun avis"}</span>
              <span className={`tag ${cocktail.alcool ? "tag--alcool" : ""}`}>{cocktail.alcool ? "Alcool" : "Sans alcool"}</span>
            </div>
            <p className="fiche__desc">{cocktail.description}</p>
            <button className={`pill ${isFavori ? "pill--mangue" : ""}`} aria-pressed={isFavori} onClick={toggleFavori}>
              {isFavori ? "Dans mes favoris" : "Ajouter aux favoris"}
            </button>
          </div>

          {cocktail.image?.[0] ? (
            <img className="fiche__photo" src={`/api${cocktail.image[0].urlimage}`} alt={cocktail.image[0].titleimage || cocktail.nomcocktail} />
          ) : (
            <div className={`fiche__photo fiche__photo--vide ${cocktail.alcool ? "recette__visuel--alcool" : "recette__visuel--moktail"}`} aria-hidden="true">
              {cocktail.alcool ? <GlasseY /> : <GlasseU />}
            </div>
          )}
        </section>

        <section className="fiche__corps">
          <div className="fiche__ingredients">
            <h2>Ingrédients</h2>
            <p className="fiche__compte">{cocktail.dosage.length} ingrédient{cocktail.dosage.length > 1 ? "s" : ""}</p>
            <ul className="dosages">
              {cocktail.dosage.map((d, i) => (
                <li key={i}>
                  <span className="dosages__nom">{d.ingredient.nomingredient}</span>
                  <span className="dosages__trait" aria-hidden="true" />
                  <span className="dosages__qte">{formatQuantite(d.quantite)}<small>{d.unite}</small></span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {ustensiles.length > 0 && (
              <>
                <h2>Matériel</h2>
                <ul className="materiel">
                  {ustensiles.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </>
            )}

            <div className="etapes__entete">
              <h2>Préparation</h2>
              {cocktail.etape.length > 0 && (
                <p className="etapes__progression" aria-live="polite">{faites.length}/{cocktail.etape.length} étape{cocktail.etape.length > 1 ? "s" : ""} faite{cocktail.etape.length > 1 ? "s" : ""}</p>
              )}
            </div>
            {cocktail.etape.length > 0 && (
              <>
                <div className="etapes__barre" aria-hidden="true">
                  <span style={{ width: `${(faites.length / cocktail.etape.length) * 100}%` }} />
                </div>
                <p className="etapes__aide">
                  {faites.length === cocktail.etape.length ? "Santé ! Tout est prêt." : "Coche chaque étape au fur et à mesure de ta préparation."}
                </p>
              </>
            )}
            <ol className="etapes">
              {cocktail.etape.map((e) => (
                <li key={e.idetape} className={`etape ${faites.includes(e.idetape) ? "etape--faite" : ""}`}>
                  <span className="etape__num" aria-hidden="true">{e.numeroetape}</span>
                  <div>
                    <p>{e.descriptionetape}</p>
                    {e.dosage && e.dosage.length > 0 && (
                      <p className="etape__ing">Avec : {e.dosage.map(formatDosage).join(", ")}</p>
                    )}
                    {e.etape_ustensile.length > 0 && (
                      <p className="etape__ing">Matériel : {e.etape_ustensile.map((u) => u.ustensile.nomustensile).join(", ")}</p>
                    )}
                  </div>
                  <button type="button" className="etape__case" aria-pressed={faites.includes(e.idetape)}
                    aria-label={`Étape ${e.numeroetape} faite`} onClick={() => basculerEtape(e.idetape)}>
                    <span aria-hidden="true">✓</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="fiche__corps fiche__avis">
          <div className="fiche__resume">
            <h2>Avis</h2>
            {cocktail.avis.length > 0 && (
              <p className="fiche__moyenne">{moyenneTexte}<small>/5</small></p>
            )}
            <p>{cocktail.avis.length > 0 ? `${cocktail.avis.length} avis` : "Aucun avis pour le moment."}</p>
            {estAuteur ? (
              <div className="fiche__auteur">
                <p className="fiche__auteur-titre">C'est ta recette</p>
                <p>Tu ne peux pas la noter toi-même, mais tu peux répondre aux avis.</p>
                <button className="pill" onClick={() => navigate(`/cocktail/${encodeURIComponent(nom!)}/modifier`)}>Modifier ma recette</button>
              </div>
            ) : token ? (
              <button className="pill pill--mangue" onClick={() => navigate(`/cocktail/${encodeURIComponent(nom!)}/avis`)}>Laisser un avis</button>
            ) : (
              <p className="fiche__connexion"><Link to="/login">Connecte-toi</Link> pour laisser un avis.</p>
            )}
          </div>

          <ul className="avis-liste">
            {cocktail.avis.map((a) => (
              <li key={a.idavis} className="avis">
                {editAvisId === a.idavis ? (
                  <div className="form-inline">
                    <select value={editNote} onChange={(e) => setEditNote(parseInt(e.target.value))} aria-label="Note">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                    </select>
                    <input value={editTitre} onChange={(e) => setEditTitre(e.target.value)} aria-label="Titre" />
                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} aria-label="Description" />
                    <div className="actions">
                      <button className="btn btn--plein" onClick={handleSauvegarderAvis}>Sauvegarder</button>
                      <button className="btn" onClick={() => setEditAvisId(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="avis__ligne">
                      <span className="avis__note">{a.noteavis}/5</span>
                      <span className="avis__titre">{a.titreavis}</span>
                    </div>
                    <p className="avis__auteur">{a.compte.pseudo}, le {new Date(a.dateavis).toLocaleDateString("fr-FR")}</p>
                    <p>{a.descriptionavis}</p>

                    <div className="actions">
                      {userIdcompte === a.idcompte && (
                        <>
                          <button className="btn" onClick={() => {
                            setEditAvisId(a.idavis);
                            setEditNote(a.noteavis);
                            setEditTitre(a.titreavis);
                            setEditDescription(a.descriptionavis);
                          }}>Modifier</button>
                          <button className="btn btn--danger" onClick={() => handleSupprimerAvis(a.idavis)}>Supprimer</button>
                        </>
                      )}
                      {token && !reponseParentId && reponseAvisId !== a.idavis && (
                        <button className="btn" onClick={() => { setReponseAvisId(a.idavis); setReponseParentId(null); setCommentaire(""); }}>Répondre</button>
                      )}
                    </div>

                    {a.reponse.length > 0 && (
                      <div className="fil">
                        {a.reponse.filter((r) => !r.idreponse_parent).map((r) => (
                          <div key={r.idreponse} className="reponse">
                            {blocReponse(r, a, true)}

                            {a.reponse.filter((sr) => sr.idreponse_parent === r.idreponse).map((sr) => (
                              <div key={sr.idreponse} className="fil reponse">
                                {blocReponse(sr, a, false)}
                              </div>
                            ))}

                            {reponseAvisId === a.idavis && reponseParentId === r.idreponse && formReponse(a, r.idreponse)}
                          </div>
                        ))}
                      </div>
                    )}

                    {token && reponseAvisId === a.idavis && !reponseParentId && formReponse(a, null)}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

export default CocktailDetail;
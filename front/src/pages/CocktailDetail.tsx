import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { GlasseY, GlasseU } from "./Logo";
import "./mycocktail.css";

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

const formatQuantite = (q: number) => Number(q).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const formatDosage = (d: Dosage) => `${formatQuantite(d.quantite)} ${d.unite} ${d.ingredient.nomingredient}`;

function CocktailDetail() {
  const { nom } = useParams();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const navigate = useNavigate();
  const [isFavori, setIsFavori] = useState(false);
  const token = localStorage.getItem("token");
  const userIdcompte = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [editAvisId, setEditAvisId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState(5);
  const [editTitre, setEditTitre] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [reponseAvisId, setReponseAvisId] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [reponseParentId, setReponseParentId] = useState<string | null>(null);
  const [editReponseId, setEditReponseId] = useState<string | null>(null);
  const [editCommentaire, setEditCommentaire] = useState("");

  const handleSauvegarderAvis = async () => {
    await axios.put(`/api/avis/${editAvisId}`, {
      noteavis: editNote,
      titreavis: editTitre,
      descriptionavis: editDescription,
    }, auth);
    setEditAvisId(null);
    window.location.reload();
  };

  const handleSupprimerAvis = async (idavis: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await axios.delete(`/api/avis/${idavis}`, auth);
    window.location.reload();
  };

  const sauvegarderReponse = async (idreponse: string) => {
    await axios.put(`/api/avis/reponse/${idreponse}`, { commentaire: editCommentaire }, auth);
    setEditReponseId(null);
    window.location.reload();
  };

  const supprimerReponse = async (idreponse: string) => {
    if (!confirm("Supprimer cette réponse ?")) return;
    await axios.delete(`/api/avis/reponse/${idreponse}`, auth);
    window.location.reload();
  };

  const envoyerReponse = async (idavis: string, parent: string | null) => {
    if (commentaire.trim().length < 2) return;
    await axios.post(`/api/avis/${idavis}/reponse`,
      parent ? { commentaire, idreponse_parent: parent } : { commentaire }, auth);
    setReponseAvisId(null);
    setReponseParentId(null);
    setCommentaire("");
    window.location.reload();
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
  }, [cocktail]);

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

  useEffect(() => {
    axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => setCocktail(res.data))
      .catch((err) => {
        if (err.response?.status === 403) navigate("/login");
        console.error(err);
      });
  }, [nom]);

  if (!cocktail) {
    return (
      <div className="layout">
        <Header />
        <main className="page"><p className="vide">Chargement…</p></main>
      </div>
    );
  }

  const ustensiles = Array.from(new Set(
    cocktail.etape.flatMap((e) => e.etape_ustensile.map((u) => u.ustensile.nomustensile))
  ));

  const moyenne = cocktail.avis.length
    ? cocktail.avis.reduce((s, a) => s + a.noteavis, 0) / cocktail.avis.length
    : 0;
  const moyenneTexte = moyenne.toFixed(1).replace(".", ",");

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
        <p className="avis__auteur">{r.compte.pseudo}</p>
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
    <div className="layout">
      <Header />
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

            <h2>Préparation</h2>
            <ol className="etapes">
              {cocktail.etape.map((e) => (
                <li key={e.idetape} className="etape">
                  <span className="etape__num" aria-hidden="true">{e.numeroetape}</span>
                  <div>
                    <p>{e.descriptionetape}</p>
                    {e.dosage && e.dosage.length > 0 && (
                      <p className="etape__ing">Avec {e.dosage.map(formatDosage).join(", ")}</p>
                    )}
                    {e.etape_ustensile.length > 0 && (
                      <p className="etape__ing">Matériel : {e.etape_ustensile.map((u) => u.ustensile.nomustensile).join(", ")}</p>
                    )}
                  </div>
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
            {token && (
              <button className="pill pill--mangue" onClick={() => navigate(`/cocktail/${nom}/avis`)}>Laisser un avis</button>
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
    </div>
  );
}

export default CocktailDetail;
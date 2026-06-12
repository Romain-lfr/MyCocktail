import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Avis {
  idavis: string;
  idcompte: string;
  noteavis: number;
  titreavis: string;
  descriptionavis: string;
  dateavis: string;
  compte: { pseudo: string };
  reponse: {
    idreponse: string;
    idcompte: string;
    commentaire: string;
    datereponse: string;
    idreponse_parent: string | null;
    compte: { pseudo: string };
  }[];
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
    dosage: {
      idingredient: string;
      quantite: number;
      unite: string;
      ingredient: { nomingredient: string };
    }[];
  }[];
  dosage: {
    idingredient: string;
    quantite: number;
    unite: string;
    ingredient: { nomingredient: string };
  }[];
  avis: Avis[];
}

function CocktailDetail() {
  const { nom } = useParams();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const navigate = useNavigate();
  const [isFavori, setIsFavori] = useState(false);
  const token = localStorage.getItem("token");
  const userIdcompte = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
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
    }, { headers: { Authorization: `Bearer ${token}` } });
    setEditAvisId(null);
    window.location.reload();
  };

  const handleSupprimerAvis = async (idavis: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await axios.delete(`/api/avis/${idavis}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  useEffect(() => {
    if (!token || !cocktail) return;
    axios.get(`/api/compte/favori/${cocktail.idcocktail}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setIsFavori(res.data.isFavori));
  }, [cocktail]);

  const toggleFavori = async () => {
    if (!token) { navigate("/login"); return; }
    if (isFavori) {
      await axios.delete(`/api/compte/favori/${cocktail!.idcocktail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavori(false);
    } else {
      await axios.post(`/api/compte/favori/${cocktail!.idcocktail}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavori(true);
    }
  };

  useEffect(() => {
    axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, {
      headers: localStorage.getItem("token") 
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        : {},
    })
      .then((res) => {
        setCocktail(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          navigate("/login");
        }
        console.error(err);
      });
  }, [nom]);

  if (!cocktail) return <p>Chargement...</p>;

  return (
    
    <div>
        <button onClick={() => navigate(-1)}>← Retour</button>
      {cocktail.image && cocktail.image[0] && (
        <img
          src={`/api${cocktail.image[0].urlimage}`}
          alt={cocktail.nomcocktail}
          width={300}
        />
      )}
      <h1>{cocktail.nomcocktail}</h1>
      <button onClick={toggleFavori}>
        {isFavori ? "❤️ Retirer des favoris" : "🤍 Ajouter aux favoris"}
      </button>
      <p>{cocktail.description}</p>
      <p>Difficulté : {cocktail.difficulte}</p>
      <p>Durée : {cocktail.duree} min</p>
      <p>{cocktail.alcool ? "🍸 Avec alcool" : "🥤 Sans alcool"}</p>

      <h2>🛒 Ingrédients totaux</h2>
      <ul>
        {cocktail.dosage.map((d, i) => (
          <li key={i}>
            {d.ingredient.nomingredient} — {d.quantite} {d.unite}
          </li>
        ))}
      </ul>

      <h2>🍴 Ustensiles nécessaires</h2>
      <ul>
        {Array.from(
          new Set(
            cocktail.etape.flatMap((e) =>
              e.etape_ustensile.map((u) => u.ustensile.nomustensile)
            )
          )
        ).map((nom, i) => (
          <li key={i}>{nom}</li>
        ))}
      </ul>

      <h2>📋 Étapes</h2>
      {cocktail.etape.map((e) => (
        <div key={e.idetape} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
          <h3>Étape {e.numeroetape}</h3>
          <p>{e.descriptionetape}</p>
          {e.etape_ustensile.length > 0 && (
            <p>🍴 Ustensiles : {e.etape_ustensile.map((u) => u.ustensile.nomustensile).join(", ")}</p>
          )}
          {e.dosage && e.dosage.length > 0 && (
            <ul>
              {e.dosage.map((d, i) => (
                <li key={i}>{d.ingredient.nomingredient} — {d.quantite} {d.unite}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <h2>Avis</h2>
      {token && (
        <button onClick={() => navigate(`/cocktail/${nom}/avis`)}>
          Laisser un avis
        </button>
      )}
      {cocktail.avis.length === 0 && <p>Aucun avis pour le moment.</p>}
      {cocktail.avis.map((a) => (
        <div key={a.idavis} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {editAvisId === a.idavis ? (
            <div>
              <select value={editNote} onChange={(e) => setEditNote(parseInt(e.target.value))}>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}/5</option>)}
              </select>
              <input value={editTitre} onChange={(e) => setEditTitre(e.target.value)} />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              <button onClick={handleSauvegarderAvis}>Sauvegarder</button>
              <button onClick={() => setEditAvisId(null)} style={{ marginLeft: '10px' }}>Annuler</button>
            </div>
          ) : (
            <div>
              <p>{a.noteavis}/5 — <strong>{a.titreavis}</strong></p>
              <p>{a.descriptionavis}</p>
              <p>Par {a.compte.pseudo} — {new Date(a.dateavis).toLocaleDateString()}</p>
              {userIdcompte === a.idcompte && (
                <>
                  <button onClick={() => {
                    setEditAvisId(a.idavis);
                    setEditNote(a.noteavis);
                    setEditTitre(a.titreavis);
                    setEditDescription(a.descriptionavis);
                  }}>Modifier</button>
                  <button onClick={() => handleSupprimerAvis(a.idavis)} style={{ color: 'red', marginLeft: '10px' }}>Supprimer</button>
                </>
              )}
              {a.reponse.length > 0 && (
                <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
                  <p><strong>Réponses :</strong></p>
                  {a.reponse.filter((r) => !r.idreponse_parent).map((r) => (
                    <div key={r.idreponse} style={{ margin: '10px 0' }}>
                      {editReponseId === r.idreponse ? (
                        <div>
                          <textarea value={editCommentaire} onChange={(e) => setEditCommentaire(e.target.value)} />
                          <button onClick={async () => {
                            await axios.put(`/api/avis/reponse/${r.idreponse}`, { commentaire: editCommentaire }, { headers: { Authorization: `Bearer ${token}` } });
                            setEditReponseId(null);
                            window.location.reload();
                          }}>Sauvegarder</button>
                          <button onClick={() => setEditReponseId(null)} style={{ marginLeft: '10px' }}>Annuler</button>
                        </div>
                      ) : (
                        <div>
                          <p>{r.commentaire}</p>
                          <p>Par {r.compte.pseudo}</p>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {token && userIdcompte !== r.idcompte && (
                              <button onClick={() => { setReponseAvisId(a.idavis); setReponseParentId(r.idreponse); setCommentaire(""); }}>
                                Répondre
                              </button>
                            )}
                            {userIdcompte === r.idcompte && (
                              <>
                                <button onClick={() => { setEditReponseId(r.idreponse); setEditCommentaire(r.commentaire); }}>Modifier</button>
                                <button onClick={async () => {
                                  if (!confirm("Supprimer cette réponse ?")) return;
                                  await axios.delete(`/api/avis/reponse/${r.idreponse}`, { headers: { Authorization: `Bearer ${token}` } });
                                  window.location.reload();
                                }} style={{ color: 'red' }}>Supprimer</button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Réponses aux réponses */}
                      {a.reponse.filter((sr) => sr.idreponse_parent === r.idreponse).map((sr) => (
                        <div key={sr.idreponse} style={{ marginLeft: '20px', borderLeft: '2px solid #eee', paddingLeft: '10px', marginTop: '5px' }}>
                          {editReponseId === sr.idreponse ? (
                            <div>
                              <textarea value={editCommentaire} onChange={(e) => setEditCommentaire(e.target.value)} />
                              <button onClick={async () => {
                                await axios.put(`/api/avis/reponse/${sr.idreponse}`, { commentaire: editCommentaire }, { headers: { Authorization: `Bearer ${token}` } });
                                setEditReponseId(null);
                                window.location.reload();
                              }}>Sauvegarder</button>
                              <button onClick={() => setEditReponseId(null)} style={{ marginLeft: '10px' }}>Annuler</button>
                            </div>
                          ) : (
                            <div>
                              <p>{sr.commentaire}</p>
                              <p>Par {sr.compte.pseudo}</p>
                              {userIdcompte === sr.idcompte && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button onClick={() => { setEditReponseId(sr.idreponse); setEditCommentaire(sr.commentaire); }}>Modifier</button>
                                  <button onClick={async () => {
                                    if (!confirm("Supprimer cette réponse ?")) return;
                                    await axios.delete(`/api/avis/reponse/${sr.idreponse}`, { headers: { Authorization: `Bearer ${token}` } });
                                    window.location.reload();
                                  }} style={{ color: 'red' }}>Supprimer</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Formulaire réponse à une réponse */}
                      {reponseAvisId === a.idavis && reponseParentId === r.idreponse && (
                        <div style={{ marginTop: '10px', marginLeft: '20px' }}>
                          <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Votre réponse..." style={{ width: '100%' }} />
                          <button onClick={async () => {
                            if (commentaire.trim().length < 2) return;
                            await axios.post(`/api/avis/${a.idavis}/reponse`, {
                              commentaire,
                              idreponse_parent: r.idreponse,
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            setReponseAvisId(null);
                            setReponseParentId(null);
                            setCommentaire("");
                            window.location.reload();
                          }}>Envoyer</button>
                          <button onClick={() => { setReponseAvisId(null); setReponseParentId(null); setCommentaire(""); }} style={{ marginLeft: '10px' }}>Annuler</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire réponse à un avis */}
              {token && (
                reponseAvisId === a.idavis && !reponseParentId ? (
                  <div style={{ marginTop: '10px' }}>
                    <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Votre réponse..." style={{ width: '100%' }} />
                    <button onClick={async () => {
                      if (commentaire.trim().length < 2) return;
                      await axios.post(`/api/avis/${a.idavis}/reponse`, { commentaire }, { headers: { Authorization: `Bearer ${token}` } });
                      setReponseAvisId(null);
                      setCommentaire("");
                      window.location.reload();
                    }}>Envoyer</button>
                    <button onClick={() => { setReponseAvisId(null); setCommentaire(""); }} style={{ marginLeft: '10px' }}>Annuler</button>
                  </div>
                ) : (
                  !reponseParentId && <button onClick={() => { setReponseAvisId(a.idavis); setReponseParentId(null); }}>Répondre</button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CocktailDetail;
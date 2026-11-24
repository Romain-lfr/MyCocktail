import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteEtoiles from "./NoteEtoiles";
import { GlasseU } from "./Logo";
import "./myxo.css";
import { avecToken, messageApi } from "../utils/api";
import { formatNote, noteMoyenne } from "../utils/format";
import { API_URL } from "../config";

interface Avis {
  idavis: string;
  noteavis: number;
  titreavis: string;
  descriptionavis: string;
  dateavis: string;
  cocktail: { nomcocktail: string };
}

function MesAvis() {
  const [avis, setAvis] = useState<Avis[] | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState(5);
  const [editTitre, setEditTitre] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get(`${API_URL}/compte/mes-avis`, avecToken())
      .then((res) => setAvis(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleModifier = (a: Avis) => {
    setEditId(a.idavis);
    setEditNote(a.noteavis);
    setEditTitre(a.titreavis);
    setEditDescription(a.descriptionavis);
    setErreurs({});
  };

  const handleSauvegarder = async () => {
    const err: Record<string, string> = {};
    if (editTitre.trim().length < 3) err.titre = "Le titre doit faire au moins 3 caractères";
    if (editDescription.trim().length < 10) err.description = "La description doit faire au moins 10 caractères";
    setErreurs(err);
    if (Object.keys(err).length > 0) return;

    try {
      await axios.put(`${API_URL}/avis/${editId}`, {
        noteavis: editNote,
        titreavis: editTitre,
        descriptionavis: editDescription,
      }, avecToken());
    } catch (e: unknown) {
      setErreurs({ global: messageApi(e) || "Erreur lors de la modification de l'avis" });
      return;
    }

    setAvis((liste) => (liste ?? []).map((a) => a.idavis === editId
      ? { ...a, noteavis: editNote, titreavis: editTitre, descriptionavis: editDescription }
      : a
    ));
    setEditId(null);
  };

  const handleSupprimer = async (idavis: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await axios.delete(`${API_URL}/avis/${idavis}`, avecToken());
    setAvis((liste) => (liste ?? []).filter((a) => a.idavis !== idavis));
  };

  const ouvrirFiche = (a: Avis) => navigate(`/cocktail/${encodeURIComponent(a.cocktail.nomcocktail)}`);

  const n = avis?.length ?? 0;
  const moyenne = formatNote(noteMoyenne(avis ?? []));

  const etat = (champ: string) => ({
    "aria-invalid": !!erreurs[champ],
    "aria-describedby": erreurs[champ] ? `erreur-${champ}` : undefined,
  });
  const message = (champ: string) =>
    erreurs[champ] && <p id={`erreur-${champ}`} className="champ__erreur">{erreurs[champ]}</p>;

  return (
    <main className="page">
      <div className="fiche__retour">
        <button className="pill" onClick={() => navigate("/compte")}>← Retour</button>
      </div>

      <header className="espace-entete">
        <div>
          <p className="surtitre">Mon espace</p>
          <h1>Mes avis</h1>
          {n > 0 && (
            <p className="espace-entete__compte">{n} avis · {moyenne}/5 de moyenne</p>
          )}
        </div>
      </header>

      {avis && n === 0 && (
        <div className="vide">
          <span className="vide__verre" aria-hidden="true"><GlasseU /></span>
          <div>
            <p className="vide__titre">Aucun avis posté.</p>
            <p>Goûte une recette, puis laisse ton avis depuis sa fiche : ça aide les autres à choisir.</p>
            <button className="pill pill--mangue" onClick={() => navigate("/")}>Découvrir les recettes</button>
          </div>
        </div>
      )}

      {n > 0 && (
        <ul className="mes-avis">
          {avis!.map((a) => (
            <li key={a.idavis} className="avis mon-avis">
              {editId === a.idavis ? (
                <div className="mon-avis__edition">
                  <p className="mon-avis__cocktail">{a.cocktail.nomcocktail}</p>
                  <NoteEtoiles valeur={editNote} onChange={setEditNote} nom={`note-${a.idavis}`} legende="Note" />
                  <div className="connexion__champ">
                    <label htmlFor={`titre-${a.idavis}`}>Titre</label>
                    <input id={`titre-${a.idavis}`} value={editTitre} onChange={(e) => setEditTitre(e.target.value)} {...etat("titre")} />
                    {message("titre")}
                  </div>
                  <div className="connexion__champ">
                    <label htmlFor={`description-${a.idavis}`}>Ton avis</label>
                    <textarea id={`description-${a.idavis}`} className="creation__texte" value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)} {...etat("description")} />
                    {message("description")}
                  </div>
                  {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}
                  <div className="actions">
                    <button className="btn btn--plein" onClick={handleSauvegarder}>Enregistrer</button>
                    <button className="btn" onClick={() => setEditId(null)}>Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mon-avis__entete">
                    <span className="avis__note">{a.noteavis}/5</span>
                    <span className="mon-avis__etoiles" aria-hidden="true">
                      {"★".repeat(a.noteavis)}<span>{"★".repeat(5 - a.noteavis)}</span>
                    </span>
                  </div>
                  <p className="avis__titre">{a.titreavis}</p>
                  <p>{a.descriptionavis}</p>
                  <p className="avis__auteur">
                    Sur <button className="mon-avis__lien" onClick={() => ouvrirFiche(a)}>{a.cocktail.nomcocktail}</button>
                    , le {new Date(a.dateavis).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="actions">
                    <button className="btn" onClick={() => handleModifier(a)}>Modifier</button>
                    <button className="btn btn--danger" onClick={() => handleSupprimer(a.idavis)}>Supprimer</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default MesAvis;

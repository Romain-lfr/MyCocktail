import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { GlasseY, GlasseU } from "./Logo";
import ImageOuSecours from "./ImageOuSecours";
import NoteEtoiles from "./NoteEtoiles";
import { idCompteDuToken } from "../utils/token";
import "./mycocktail.css";
import { avecToken, tokenSiConnecte, messageApi } from "../utils/api";
import { API_URL } from "../config";

interface CocktailResume {
  idcocktail: string;
  nomcocktail: string;
  idcompte: string;
  alcool: boolean;
  image?: { urlimage: string; titleimage?: string }[];
}

const MIN_DESCRIPTION = 10;

function AjouterAvis() {
  const { nom } = useParams();
  const [cocktail, setCocktail] = useState<CocktailResume | null>(null);
  const [note, setNote] = useState(5);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const estAuteur = !!cocktail && idCompteDuToken(token) === cocktail.idcompte;

  // Le cocktail est chargé dès l'ouverture : photo, id pour l'envoi, et vérification « c'est ma recette »
  useEffect(() => {
    axios.get(`${API_URL}/cocktail/${encodeURIComponent(nom!)}`, tokenSiConnecte())
      .then((res) => setCocktail(res.data))
      .catch(() => setErreurs({ global: "Cocktail introuvable." }));
  }, [nom, token]);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (titre.trim().length < 3) err.titre = "Le titre doit faire au moins 3 caractères";
    if (description.trim().length < MIN_DESCRIPTION) err.description = "La description doit faire au moins 10 caractères";
    setErreurs(err);
    if (Object.keys(err).length > 0) return;

    if (!token) { navigate("/login"); return; }
    if (!cocktail) return;

    setChargement(true);
    try {
      await axios.post(`${API_URL}/avis/${cocktail.idcocktail}`, {
        noteavis: note,
        titreavis: titre,
        descriptionavis: description,
      }, avecToken());
      navigate(`/cocktail/${encodeURIComponent(nom!)}`);
    } catch (err: unknown) {
      setErreurs({ global: messageApi(err) || "Erreur lors de l'ajout de l'avis" });
    } finally {
      setChargement(false);
    }
  };

  const etat = (champ: string) => ({
    "aria-invalid": !!erreurs[champ],
    "aria-describedby": [erreurs[champ] ? `erreur-${champ}` : "", champ === "description" ? "aide-description" : ""].filter(Boolean).join(" ") || undefined,
  });
  const message = (champ: string) =>
    erreurs[champ] && <p id={`erreur-${champ}`} className="champ__erreur">{erreurs[champ]}</p>;

  const image = cocktail?.image?.[0];
  const restant = Math.max(0, MIN_DESCRIPTION - description.trim().length);

  return (
    <main className="connexion avis-page">
      <section className={`connexion__gauche ${cocktail && !cocktail.alcool ? "connexion__gauche--citron" : ""}`} aria-label="Recette notée">
        <ImageOuSecours
          className="avis-page__photo"
          src={image && `${API_URL}${image.urlimage}`}
          alt={image?.titleimage || nom || ""}
          secours={cocktail?.alcool === false
            ? <GlasseU className="connexion__verre" />
            : <GlasseY className="connexion__verre" />}
        />
        <p className="connexion__slogan">{nom}</p>
      </section>

      <section className="connexion__droite">
        <div className="fiche__retour avis-page__retour">
          <button className="pill" onClick={() => navigate(-1)}>← Retour</button>
        </div>
        <p className="surtitre">Ton avis</p>
        <h1>Laisser un avis sur {nom}</h1>

        {estAuteur ? (
          <div className="fiche__auteur">
            <p className="fiche__auteur-titre">C'est ta recette</p>
            <p>Tu ne peux pas la noter toi-même, mais tu peux répondre aux avis depuis sa fiche.</p>
            <button className="pill" onClick={() => navigate(`/cocktail/${encodeURIComponent(nom!)}`)}>Voir la fiche</button>
          </div>
        ) : (
          <form onSubmit={envoyer} noValidate>
            <NoteEtoiles valeur={note} onChange={setNote} />

            <div className="connexion__champ">
              <label htmlFor="titre">Titre</label>
              <input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="En quelques mots…" {...etat("titre")} />
              {message("titre")}
            </div>

            <div className="connexion__champ">
              <label htmlFor="description">Ton avis</label>
              <textarea id="description" className="creation__texte" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Le goût, l'équilibre, la difficulté réelle, ce que tu changerais…" {...etat("description")} />
              <p id="aide-description" className="connexion__aide">
                {restant > 0 ? `Encore ${restant} caractère${restant > 1 ? "s" : ""} minimum` : "C'est parfait."}
              </p>
              {message("description")}
            </div>

            {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}

            <button type="submit" className="pill pill--mangue connexion__envoi" disabled={chargement || !cocktail}>
              {chargement ? "Publication…" : "Publier l'avis"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default AjouterAvis;

import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./myxo.css";
import { avecToken, messageApi } from "../utils/api";
import { API_URL } from "../config";

// Mêmes règles que l'API (jpg, png ou webp, 5 Mo max), vérifiées avant l'envoi
const FORMATS_PHOTO = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX_PHOTO = 5 * 1024 * 1024;

function ModifierCompte() {
  const [pseudo, setPseudo] = useState("");
  const [mailcompte, setMail] = useState("");
  const [numtel, setNumtel] = useState("");
  const [datenaissance, setDatenaissance] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [messagePhoto, setMessagePhoto] = useState<{ erreur: boolean; texte: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get(`${API_URL}/compte/me`, avecToken()).then((res) => {
      setPseudo(res.data.pseudo);
      setMail(res.data.mailcompte);
      setNumtel(res.data.numtel || "");
      setDatenaissance(res.data.datenaissance.split('T')[0]);
      setPhoto(res.data.photo ?? null);
    }).catch(() => navigate("/login"));
  }, [navigate]);

  const valider = () => {
    const err: Record<string, string> = {};
    if (pseudo.trim().length < 3) err.pseudo = "Le pseudo doit faire au moins 3 caractères";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailcompte)) err.mail = "Email invalide";
    if (numtel && !/^\+?[\d\s-]{7,20}$/.test(numtel)) err.numtel = "Numéro de téléphone invalide";
    return err;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSucces("");
    const err = valider();
    setErreurs(err);
    if (Object.keys(err).length > 0) return;

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    setChargement(true);
    try {
      await axios.put(`${API_URL}/compte/me`, {
        pseudo,
        mailcompte,
        numtel: numtel || null,
      }, avecToken());
      setSucces("Profil mis à jour !");
    } catch (err: unknown) {
      setErreurs({ global: messageApi(err) || "Erreur lors de la modification" });
    } finally {
      setChargement(false);
    }
  };

  const changerPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = ""; // permet de rechoisir le même fichier après une erreur
    if (!fichier) return;
    if (!FORMATS_PHOTO.includes(fichier.type)) {
      setMessagePhoto({ erreur: true, texte: "Format non supporté (jpg, png ou webp)" });
      return;
    }
    if (fichier.size > TAILLE_MAX_PHOTO) {
      setMessagePhoto({ erreur: true, texte: "Image trop lourde (5 Mo maximum)" });
      return;
    }
    const formData = new FormData();
    formData.append("image", fichier);
    setEnvoiPhoto(true);
    setMessagePhoto(null);
    try {
      const res = await axios.post(`${API_URL}/compte/me/photo`, formData, avecToken());
      setPhoto(res.data.photo);
      setMessagePhoto({ erreur: false, texte: "Photo mise à jour !" });
    } catch (err: unknown) {
      setMessagePhoto({ erreur: true, texte: messageApi(err) || "Erreur lors de l'envoi de la photo" });
    } finally {
      setEnvoiPhoto(false);
    }
  };

  const retirerPhoto = async () => {
    if (!window.confirm("Retirer ta photo de profil ?")) return;
    try {
      await axios.delete(`${API_URL}/compte/me/photo`, avecToken());
      setPhoto(null);
      setMessagePhoto({ erreur: false, texte: "Photo retirée." });
    } catch (err: unknown) {
      setMessagePhoto({ erreur: true, texte: messageApi(err) || "Erreur lors du retrait de la photo" });
    }
  };

  // Champ invalide relié à son message d'erreur (et à son aide éventuelle)
  const etat = (champ: string, aide?: string) => ({
    "aria-invalid": !!erreurs[champ],
    "aria-describedby": [erreurs[champ] ? `erreur-${champ}` : "", aide ?? ""].filter(Boolean).join(" ") || undefined,
  });
  const message = (champ: string) =>
    erreurs[champ] && <p id={`erreur-${champ}`} className="champ__erreur">{erreurs[champ]}</p>;

  return (
    <main className="connexion modifier-compte">
      {/* Aperçu en direct, comme sur la page Mon compte */}
      <section className="connexion__gauche profil__gauche" aria-label="Aperçu du profil">
        <Avatar className="profil__avatar" pseudo={pseudo} photo={photo} />
        <div className="photo-profil">
          <label className={`pill photo-profil__choisir ${envoiPhoto ? "photo-profil__choisir--envoi" : ""}`}>
            {envoiPhoto ? "Envoi…" : photo ? "Changer la photo" : "Ajouter une photo"}
            <input type="file" className="sr-only" accept={FORMATS_PHOTO.join(",")} onChange={changerPhoto}
              disabled={envoiPhoto} aria-describedby="aide-photo" />
          </label>
          {photo && <button type="button" className="pill" onClick={retirerPhoto}>Retirer</button>}
        </div>
        <p id="aide-photo" className="photo-profil__aide">JPG, PNG ou WebP, 5 Mo maximum</p>
        {messagePhoto && (
          <p role={messagePhoto.erreur ? "alert" : "status"} className={`photo-profil__message ${messagePhoto.erreur ? "photo-profil__message--erreur" : ""}`}>
            {messagePhoto.texte}
          </p>
        )}
        <p className="connexion__slogan">{pseudo.trim() || "Ton pseudo"}</p>
        <p className="profil__mail">{mailcompte}</p>
      </section>

      <section className="connexion__droite">
        <div className="fiche__retour avis-page__retour">
          <button className="pill" onClick={() => navigate("/compte")}>← Retour</button>
        </div>
        <p className="surtitre">Mon compte</p>
        <h1>Modifier mon profil</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="connexion__champ">
            <label htmlFor="pseudo">Pseudo</label>
            <input id="pseudo" autoComplete="username" value={pseudo} onChange={(e) => setPseudo(e.target.value)} {...etat("pseudo")} />
            {message("pseudo")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="mail">E-mail</label>
            <input id="mail" type="email" autoComplete="email" value={mailcompte} onChange={(e) => setMail(e.target.value)} {...etat("mail")} />
            {message("mail")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="numtel">Téléphone <small className="modifier-compte__facultatif">(facultatif)</small></label>
            <input id="numtel" type="tel" autoComplete="tel" value={numtel} onChange={(e) => setNumtel(e.target.value)}
              placeholder="+33 6 00 00 00 00" {...etat("numtel")} />
            {message("numtel")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="naissance">Date de naissance</label>
            <input id="naissance" type="date" value={datenaissance} disabled aria-describedby="aide-naissance" />
            <p id="aide-naissance" className="connexion__aide">La date de naissance n'est pas modifiable.</p>
          </div>

          {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}
          {succes && <p role="status" className="connexion__succes">{succes}</p>}

          <button type="submit" className="pill pill--mangue connexion__envoi" disabled={chargement}>
            {chargement ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ModifierCompte;

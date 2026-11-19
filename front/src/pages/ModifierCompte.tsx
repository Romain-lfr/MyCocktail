import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./mycocktail.css";
import { avecToken, messageApi } from "../utils/api";

function ModifierCompte() {
  const [pseudo, setPseudo] = useState("");
  const [mailcompte, setMail] = useState("");
  const [numtel, setNumtel] = useState("");
  const [datenaissance, setDatenaissance] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/me", avecToken()).then((res) => {
      setPseudo(res.data.pseudo);
      setMail(res.data.mailcompte);
      setNumtel(res.data.numtel || "");
      setDatenaissance(res.data.datenaissance.split('T')[0]);
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
      await axios.put("/api/compte/me", {
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
        <div className="profil__avatar" aria-hidden="true">{pseudo.trim().charAt(0) || "?"}</div>
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

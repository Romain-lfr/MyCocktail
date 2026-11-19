import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GlasseU } from "./Logo";
import "./mycocktail.css";
import { messageApi } from "../utils/api";

type Champ = "pseudo" | "mail" | "mdp" | "confirmMdp" | "dateNaissance" | "global";

// Règles du mot de passe, affichées en direct sous le champ
const REGLES_MDP = [
  { libelle: "8 caractères minimum", ok: (m: string) => m.length >= 8 },
  { libelle: "Une majuscule", ok: (m: string) => /[A-Z]/.test(m) },
  { libelle: "Un chiffre", ok: (m: string) => /[0-9]/.test(m) },
];

function Register() {
  const [pseudo, setPseudo] = useState("");
  const [mail, setMail] = useState("");
  const [mdp, setMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [voir, setVoir] = useState(false);
  const [erreurs, setErreurs] = useState<Partial<Record<Champ, string>>>({});
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  // Déjà connecté : retour à l'accueil
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  const valider = () => {
    const err: Partial<Record<Champ, string>> = {};

    if (pseudo.trim().length < 3)
      err.pseudo = "Le pseudo doit faire au moins 3 caractères";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      err.mail = "Email invalide";

    if (mdp.length < 8)
      err.mdp = "Le mot de passe doit faire au moins 8 caractères";
    else if (!/[A-Z]/.test(mdp))
      err.mdp = "Le mot de passe doit contenir au moins une majuscule";
    else if (!/[0-9]/.test(mdp))
      err.mdp = "Le mot de passe doit contenir au moins un chiffre";
    else if (mdp !== confirmMdp)
      err.confirmMdp = "Les mots de passe ne correspondent pas";

    if (!dateNaissance)
      err.dateNaissance = "La date de naissance est obligatoire";
    else if (new Date(dateNaissance) >= new Date())
      err.dateNaissance = "La date de naissance doit être dans le passé";

    return err;
  };

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    const err = valider();
    setErreurs(err);
    if (Object.keys(err).length > 0) return;

    setChargement(true);
    try {
      await axios.post("/api/auth/register", { pseudo, mail, mdp, dateNaissance });
      navigate("/login");
    } catch (e: unknown) {
      const message = messageApi(e);
      setErreurs({ global: message || "Erreur lors de la création du compte" });
    } finally {
      setChargement(false);
    }
  };

  // Props communes : champ invalide relié à son message d'erreur
  const etat = (champ: Champ) => ({
    "aria-invalid": !!erreurs[champ],
    "aria-describedby": erreurs[champ] ? `erreur-${champ}` : undefined,
  });
  const message = (champ: Champ) =>
    erreurs[champ] && <p id={`erreur-${champ}`} className="champ__erreur">{erreurs[champ]}</p>;

  return (
    <main className="connexion">
      <section className="connexion__gauche connexion__gauche--citron" aria-hidden="true">
        <GlasseU className="connexion__verre" />
        <p className="connexion__slogan">Ton bar commence ici.</p>
      </section>

      <section className="connexion__droite">
        <p className="surtitre">Bienvenue</p>
        <h1>Créer un compte</h1>
        <form onSubmit={envoyer} noValidate>
          <div className="connexion__champ">
            <label htmlFor="pseudo">Pseudo</label>
            <input id="pseudo" autoComplete="username" value={pseudo} onChange={(e) => setPseudo(e.target.value)} {...etat("pseudo")} />
            {message("pseudo")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="mail">E-mail</label>
            <input id="mail" type="email" autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} {...etat("mail")} />
            {message("mail")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="naissance">Date de naissance</label>
            <input id="naissance" type="date" autoComplete="bday" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)}
              {...etat("dateNaissance")} />
            {message("dateNaissance") || <p className="connexion__aide">Moins de 18 ans ? Tu verras uniquement les recettes sans alcool.</p>}
          </div>

          <div className="connexion__champ">
            <label htmlFor="mdp">Mot de passe</label>
            <div className="connexion__mdp">
              <input id="mdp" type={voir ? "text" : "password"} autoComplete="new-password" value={mdp} onChange={(e) => setMdp(e.target.value)}
                {...etat("mdp")} />
              <button type="button" className="connexion__voir" onClick={() => setVoir(!voir)} aria-pressed={voir}>
                {voir ? "Masquer" : "Afficher"}
              </button>
            </div>
            <ul className="regles" aria-label="Règles du mot de passe">
              {REGLES_MDP.map((r) => {
                const ok = r.ok(mdp);
                return (
                  <li key={r.libelle} className={ok ? "regles__ok" : ""}>
                    <span aria-hidden="true">{ok ? "✓" : "•"}</span> {r.libelle}
                    <span className="sr-only">{ok ? " : respectée" : " : à respecter"}</span>
                  </li>
                );
              })}
            </ul>
            {message("mdp")}
          </div>

          <div className="connexion__champ">
            <label htmlFor="confirm">Confirmer le mot de passe</label>
            <input id="confirm" type={voir ? "text" : "password"} autoComplete="new-password" value={confirmMdp}
              onChange={(e) => setConfirmMdp(e.target.value)} {...etat("confirmMdp")} />
            {message("confirmMdp")}
          </div>

          {erreurs.global && <p role="alert" className="connexion__erreur">{erreurs.global}</p>}

          <button type="submit" className="pill pill--mangue connexion__envoi" disabled={chargement}>
            {chargement ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="connexion__alt">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </section>
    </main>
  );
}

export default Register;

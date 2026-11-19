import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GlasseY } from "./Logo";
import "./mycocktail.css";

const URL_CONNEXION = "/api/auth/login";
const corps = (email: string, mdp: string) => ({ pseudoOrMail: email, mdp });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  // Déjà connecté : retour à l'accueil
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/");
  }, []);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const res = await axios.post(URL_CONNEXION, corps(email.trim().toLowerCase(), mdp));
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("estMineur", String(!!res.data.estMineur));
      navigate("/");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setErreur(
        status === 400 || status === 401 || status === 404
          ? "E-mail ou mot de passe incorrect."
          : "Connexion impossible pour le moment. Réessayez dans un instant."
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <>
      <main className="connexion">
        <section className="connexion__gauche" aria-hidden="true">
          <GlasseY className="connexion__verre" />
          <p className="connexion__slogan">Vos favoris, votre frigo et vos avis vous attendent.</p>
        </section>

        <section className="connexion__droite">
          <p className="surtitre">Bon retour</p>
          <h1>Connexion</h1>
          <form onSubmit={envoyer} noValidate>
            <div className="connexion__champ">
              <label htmlFor="email">E-mail</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!erreur} aria-describedby={erreur ? "erreur-connexion" : undefined}
              />
            </div>

            <div className="connexion__champ">
              <label htmlFor="mdp">Mot de passe</label>
              <div className="connexion__mdp">
                <input
                  id="mdp" type={voir ? "text" : "password"} autoComplete="current-password" required
                  value={mdp} onChange={(e) => setMdp(e.target.value)}
                  aria-invalid={!!erreur} aria-describedby={erreur ? "erreur-connexion" : undefined}
                />
                <button type="button" className="connexion__voir" onClick={() => setVoir(!voir)} aria-pressed={voir}>
                  {voir ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {erreur && <p id="erreur-connexion" role="alert" className="connexion__erreur">{erreur}</p>}

            <button type="submit" className="pill pill--mangue connexion__envoi" disabled={chargement || !email || !mdp}>
              {chargement ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="connexion__alt">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
        </section>
      </main>
    </>
  );
}

export default Login;
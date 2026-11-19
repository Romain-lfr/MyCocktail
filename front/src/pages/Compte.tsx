import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./mycocktail.css";

interface CompteInfo {
  idcompte: string;
  pseudo: string;
  mailcompte: string;
  numtel?: string | null;
  dateinscription: string;
  datenaissance: string;
  role: string;
}

const libelleRole: Record<string, string> = {
  user: "Membre",
  moderateur: "Modérateur",
  admin: "Administrateur",
};

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");
const moisAnnee = (d: string) => new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

const ESPACE = [
  { to: "/compte/cocktails", titre: "Mes cocktails", texte: "Tes créations, brouillons compris" },
  { to: "/compte/favoris", titre: "Mes favoris", texte: "Les recettes gardées sous le coude" },
  { to: "/compte/frigo", titre: "Mon frigo", texte: "Tes ingrédients et ce qu'ils permettent" },
  { to: "/compte/avis", titre: "Mes avis", texte: "Tes notes et commentaires" },
];

function Profil() {
  const [compte, setCompte] = useState<CompteInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("/api/compte/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setCompte(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("estMineur");
        navigate("/login");
      });
  }, []);

  if (!compte) {
    return (
      <>
        <main className="page"><p className="vide">Chargement…</p></main>
      </>
    );
  }

  return (
    <>
      <main className="profil">
        <section className="profil__gauche" aria-label="Aperçu du compte">
          <p className="surtitre profil__surtitre">Mon compte</p>
          <div className="profil__avatar" aria-hidden="true">{compte.pseudo.charAt(0)}</div>
          <h1>{compte.pseudo}</h1>
          <p className="profil__mail">{compte.mailcompte}</p>
          <span className="profil__role">{libelleRole[compte.role] ?? compte.role}</span>
          <p className="profil__depuis">Au bar depuis {moisAnnee(compte.dateinscription)}</p>
        </section>

        <section className="profil__droite">
          <h2>Mon espace</h2>
          <ul className="espace">
            {ESPACE.map((e, i) => (
              <li key={e.to}>
                <Link to={e.to}>
                  <span className="espace__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="espace__titre">{e.titre}</span>
                  <span className="espace__texte">{e.texte}</span>
                  <span className="espace__fleche" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <h2>Informations</h2>
          <dl className="infos">
            <dt>Pseudo</dt><dd>{compte.pseudo}</dd>
            <dt>E-mail</dt><dd>{compte.mailcompte}</dd>
            {compte.numtel && (<><dt>Téléphone</dt><dd>{compte.numtel}</dd></>)}
            <dt>Date de naissance</dt><dd>{formatDate(compte.datenaissance)}</dd>
            <dt>Membre depuis le</dt><dd>{formatDate(compte.dateinscription)}</dd>
          </dl>

          <div className="profil__action">
            <button className="pill" onClick={() => navigate("/compte/modifier")}>Modifier les informations</button>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profil;
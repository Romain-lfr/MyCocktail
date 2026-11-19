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
          <div className="profil__avatar" aria-hidden="true">{compte.pseudo.charAt(0)}</div>
          <h1>{compte.pseudo}</h1>
          <p className="profil__mail">{compte.mailcompte}</p>
          <span className="profil__role">{libelleRole[compte.role] ?? compte.role}</span>
        </section>

        <section className="profil__droite">
          <h2>Informations</h2>
          <dl className="infos">
            <dt>Pseudo</dt><dd>{compte.pseudo}</dd>
            <dt>E-mail</dt><dd>{compte.mailcompte}</dd>
            {compte.numtel && (<><dt>Téléphone</dt><dd>{compte.numtel}</dd></>)}
            <dt>Date de naissance</dt><dd>{formatDate(compte.datenaissance)}</dd>
            <dt>Membre depuis le</dt><dd>{formatDate(compte.dateinscription)}</dd>
          </dl>

          <h2>Mon espace</h2>
          <ul className="profil__liens">
            <li><Link to="/compte/cocktails">Mes cocktails <span aria-hidden="true">→</span></Link></li>
            <li><Link to="/compte/favoris">Mes favoris <span aria-hidden="true">→</span></Link></li>
            <li><Link to="/compte/frigo">Mon frigo <span aria-hidden="true">→</span></Link></li>
            <li><Link to="/compte/avis">Mes avis <span aria-hidden="true">→</span></Link></li>
          </ul>

          <div className="profil__action">
            <button className="pill" onClick={() => navigate("/compte/modifier")}>Modifier les informations</button>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profil;
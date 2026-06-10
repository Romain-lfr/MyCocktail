import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Compte {
  idcompte: string;
  pseudo: string;
  mailcompte: string;
  numtel: string | null;
  dateinscription: string;
  datenaissance: string;
  role: string;
}

function InfoCompte() {
  const [compte, setCompte] = useState<Compte | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setCompte(res.data))
      .catch(() => navigate("/login"));
  }, []);

  if (!compte) return <p>Chargement...</p>;

  return (
    <div>
      <button onClick={() => navigate("/compte")}>← Retour</button>
      <h1>Mon profil</h1>

      <p>Pseudo : {compte.pseudo}</p>
      <p>Email : {compte.mailcompte}</p>
      <p>Téléphone : {compte.numtel || "Non renseigné"}</p>
      <p>Date de naissance : {new Date(compte.datenaissance).toLocaleDateString()}</p>
      <p>Inscrit le : {new Date(compte.dateinscription).toLocaleDateString()}</p>
      <p>Rôle : {compte.role}</p>

      <button onClick={() => navigate("/compte/modifier")}>
        Modifier mon profil
      </button>
    </div>
  );
}

export default InfoCompte;
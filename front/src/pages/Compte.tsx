import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Compte {
  idcompte: string;
  pseudo: string;
  mailcompte: string;
  dateinscription: string;
  datenaissance: string;
  role: string;
}

function Compte() {
  const [compte, setCompte] = useState<Compte | null>(null);
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

  if (!compte) return <p>Chargement...</p>;

  return (
    <div>
      <h1>👤 {compte.pseudo}</h1>
      <p>Email : {compte.mailcompte}</p>
      <p>Rôle : {compte.role}</p>
      <p>Inscrit le : {new Date(compte.dateinscription).toLocaleDateString()}</p>
      <p>Date de naissance : {new Date(compte.datenaissance).toLocaleDateString()}</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        <div onClick={() => navigate("/compte/cocktails")} style={{ cursor: 'pointer', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', width: '150px', textAlign: 'center' }}>
          <h2>🍹</h2>
          <p>Mes cocktails</p>
        </div>
        <div onClick={() => navigate("/compte/favoris")} style={{ cursor: 'pointer', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', width: '150px', textAlign: 'center' }}>
          <h2>❤️</h2>
          <p>Mes favoris</p>
        </div>
        <div onClick={() => navigate("/compte/frigo")} style={{ cursor: 'pointer', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', width: '150px', textAlign: 'center' }}>
          <h2>🧊</h2>
          <p>Mon frigo</p>
        </div>
        <div onClick={() => navigate("/compte/avis")} style={{ cursor: 'pointer', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', width: '150px', textAlign: 'center' }}>
          <h2>⭐</h2>
          <p>Mes avis</p>
        </div>
      </div>
    </div>
  );
}

export default Compte;
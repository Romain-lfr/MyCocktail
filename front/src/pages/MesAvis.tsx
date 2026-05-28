import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Avis {
  idavis: string;
  noteavis: number;
  titreavis: string;
  descriptionavis: string;
  dateavis: string;
  cocktail: { nomcocktail: string };
}

function MesAvis() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/mes-avis", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setAvis(res.data))
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/compte")}>← Retour</button>
      <h1>⭐ Mes avis</h1>
      {avis.length === 0 && <p>Aucun avis posté.</p>}
      {avis.map((a) => (
        <div key={a.idavis} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p>⭐ {a.noteavis}/5 — <strong>{a.titreavis}</strong></p>
          <p>{a.descriptionavis}</p>
          <p>Cocktail : <span onClick={() => navigate(`/cocktail/${encodeURIComponent(a.cocktail.nomcocktail)}`)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{a.cocktail.nomcocktail}</span></p>
          <p>{new Date(a.dateavis).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

export default MesAvis;
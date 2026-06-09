import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Favori {
  cocktail: {
    idcocktail: string;
    nomcocktail: string;
    image: { urlimage: string }[];
  };
}

function MesFavoris() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/mes-favoris", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setFavoris(res.data))
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/compte")}>← Retour</button>
      <h1>❤️ Mes favoris</h1>
      {favoris.length === 0 && <p>Aucun favori.</p>}
      {favoris.map((f, i) => (
        <div key={i} onClick={() => navigate(`/cocktail/${encodeURIComponent(f.cocktail.nomcocktail)}`)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {f.cocktail.image && f.cocktail.image[0] && (
            <img src={`/api${f.cocktail.image[0].urlimage}`} width={100} />
          )}
          <p>{f.cocktail.nomcocktail}</p>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const token = localStorage.getItem("token");
              await axios.delete(`/api/compte/favori/${f.cocktail.idcocktail}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              window.location.reload();
            }}
            style={{ color: 'red', marginLeft: '10px' }}
          >
            Retirer
          </button>
        </div>
      ))}
      
    </div>
  );
}

export default MesFavoris;
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Favori {
  cocktail: {
    idcocktail: string;
    nomcocktail: string;
    image_cocktail: { image: { urlimage: string } }[];
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
          {f.cocktail.image_cocktail[0] && <img src={`/api${f.cocktail.image_cocktail[0].image.urlimage}`} width={100} />}
          <p>{f.cocktail.nomcocktail}</p>
        </div>
      ))}
    </div>
  );
}

export default MesFavoris;
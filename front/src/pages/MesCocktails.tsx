import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Cocktail {
  idcocktail: string;
  nomcocktail: string;
  image_cocktail: { image: { urlimage: string } }[];
}

function MesCocktails() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/mes-cocktails", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setCocktails(res.data))
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/compte")}>← Retour</button>
      <h1>🍹 Mes cocktails</h1>
      {cocktails.length === 0 && <p>Aucun cocktail créé.</p>}
      {cocktails.map((c) => (
        <div key={c.idcocktail} onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {c.image_cocktail[0] && <img src={`/api${c.image_cocktail[0].image.urlimage}`} width={100} />}
          <p>{c.nomcocktail}</p>
        </div>
      ))}
    </div>
  );
}

export default MesCocktails;
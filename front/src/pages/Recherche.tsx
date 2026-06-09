import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Cocktail {
  idcocktail: string;
  nomcocktail: string;
  image: { urlimage: string }[];
}

interface Compte {
  idcompte: string;
  pseudo: string;
  dateinscription: string;
}

function Recherche() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recherche = searchParams.get("q") || "";

  useEffect(() => {
    if (!recherche) return;
    const token = localStorage.getItem("token");
    const estMineur = localStorage.getItem("estMineur") === "true";
    const url = token && !estMineur
      ? `/api/cocktail?recherche=${encodeURIComponent(recherche)}`
      : `/api/cocktail?alcool=false&recherche=${encodeURIComponent(recherche)}`;

    console.log("URL recherche:", url);

    axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => {
      console.log("cocktails reçus:", res.data.length);
      setCocktails(res.data);
    });

    axios.get(`/api/compte/recherche/${encodeURIComponent(recherche)}`)
      .then((res) => setComptes(res.data))
      .catch((err) => console.error("erreur comptes:", err));
  }, [recherche]);

  return (
    <div>
      <h1>Résultats pour "{recherche}"</h1>

      <h2>Cocktails</h2>
      {cocktails.length === 0 && <p>Aucun cocktail trouvé.</p>}
      {cocktails.map((c) => (
        <div key={c.idcocktail} onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {c.image && c.image[0] && <img src={`/api${c.image[0].urlimage}`} width={100} />}
          <p>{c.nomcocktail}</p>
        </div>
      ))}

      <h2>Comptes</h2>
      {comptes.length === 0 && <p>Aucun compte trouvé.</p>}
      {comptes.map((c) => (
        <div key={c.idcompte} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p>{c.pseudo}</p>
          <p>Inscrit le : {new Date(c.dateinscription).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

export default Recherche;
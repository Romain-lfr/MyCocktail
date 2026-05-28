import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import axios from "axios";

interface Avis {
  idavis: string;
  noteavis: number;
  titreavis: string;
  descriptionavis: string;
  dateavis: string;
  compte: { pseudo: string };
  reponse: {
    idreponse: string;
    commentaire: string;
    compte: { pseudo: string };
  }[];
}

interface Cocktail {
  idcocktail: string;
  nomcocktail: string;
  description: string;
  difficulte: string;
  alcool: boolean;
  duree: number;
  image_cocktail: { image: { urlimage: string; titleimage: string } }[];
  etape: {
    idetape: string;
    numeroetape: number;
    descriptionetape: string;
    etape_ustensile: { ustensile: { nomustensile: string } }[];
  }[];
  dosage: {
    quantite: number;
    unite: string;
    ingredient: { nomingredient: string };
  }[];
  avis: Avis[];
}

function CocktailDetail() {
  const { nom } = useParams();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, {
      headers: localStorage.getItem("token") 
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        : {},
    })
      .then((res) => {
        setCocktail(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          navigate("/login");
        }
        console.error(err);
      });
  }, [nom]);

  if (!cocktail) return <p>Chargement...</p>;

  return (
    
    <div>
        <button onClick={() => navigate(-1)}>← Retour</button>
      {cocktail.image_cocktail[0] && (
        <img
          src={`/api${cocktail.image_cocktail[0].image.urlimage}`}
          alt={cocktail.nomcocktail}
          width={300}
        />
      )}
      <h1>{cocktail.nomcocktail}</h1>
      <p>{cocktail.description}</p>
      <p>Difficulté : {cocktail.difficulte}</p>
      <p>Durée : {cocktail.duree} min</p>
      <p>{cocktail.alcool ? "🍸 Avec alcool" : "🥤 Sans alcool"}</p>

      <h2>Ingrédients</h2>
      <ul>
        {cocktail.dosage.map((d, i) => (
          <li key={i}>
            {d.ingredient.nomingredient} - {d.quantite} {d.unite}
          </li>
        ))}
      </ul>

      <h2>Étapes</h2>
      {cocktail.etape.map((e) => (
        <div key={e.idetape}>
          <h3>Étape {e.numeroetape}</h3>
          <p>{e.descriptionetape}</p>
          {e.etape_ustensile.length > 0 && (
            <p>Ustensiles : {e.etape_ustensile.map((u) => u.ustensile.nomustensile).join(", ")}</p>
          )}
        </div>
      ))}

      <h2>Avis</h2>
      {cocktail.avis.length === 0 && <p>Aucun avis pour le moment.</p>}
      {cocktail.avis.map((a) => (
        <div key={a.idavis} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p>⭐ {a.noteavis}/5 — <strong>{a.titreavis}</strong></p>
          <p>{a.descriptionavis}</p>
          <p>Par {a.compte.pseudo} — {new Date(a.dateavis).toLocaleDateString()}</p>

          {a.reponse.length > 0 && (
            <div style={{ marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              <p><strong>Réponse :</strong></p>
              {a.reponse.map((r) => (
                <div key={r.idreponse}>
                  <p>{r.commentaire}</p>
                  <p>Par {r.compte.pseudo}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CocktailDetail;
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AjouterCocktail() {
  const [nomcocktail, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [difficulte, setDifficulte] = useState("Facile");
  const [alcool, setAlcool] = useState(false);
  const [duree, setDuree] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const valider = () => {
    const err: Record<string, string> = {};
    if (nomcocktail.trim().length < 2)
      err.nom = "Le nom doit faire au moins 2 caractères";
    if (description.trim().length < 10)
      err.description = "La description doit faire au moins 10 caractères";
    if (duree < 1)
      err.duree = "La durée doit être positive";
    return err;
  };

  const handleSubmit = async () => {
    const err = valider();
    if (Object.keys(err).length > 0) { setErreurs(err); return; }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      // 1. Créer le cocktail
      const res = await axios.post("/api/cocktail", {
        nomcocktail, description, difficulte, alcool, duree,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idcocktail = res.data.idcocktail;

      // 2. Upload image si présente
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        await axios.post(`/api/cocktail/${idcocktail}/image`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      navigate(`/cocktail/${encodeURIComponent(res.data.nomcocktail)}`);
    } catch (err: any) {
      setErreurs({ global: err.response?.data?.message || "Erreur lors de la création" });
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h1>🍹 Ajouter un cocktail</h1>

      <div>
        <label>Nom</label>
        <input value={nomcocktail} onChange={(e) => setNom(e.target.value)} placeholder="Nom du cocktail" />
        {erreurs.nom && <p style={{ color: 'red' }}>{erreurs.nom}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        {erreurs.description && <p style={{ color: 'red' }}>{erreurs.description}</p>}
      </div>

      <div>
        <label>Difficulté</label>
        <select value={difficulte} onChange={(e) => setDifficulte(e.target.value)}>
          <option value="Facile">Facile</option>
          <option value="Moyen">Moyen</option>
          <option value="Difficile">Difficile</option>
        </select>
      </div>

      <div>
        <label>Avec alcool ?</label>
        <input type="checkbox" checked={alcool} onChange={(e) => setAlcool(e.target.checked)} />
      </div>

      <div>
        <label>Durée (minutes)</label>
        <input type="number" value={duree} onChange={(e) => setDuree(parseInt(e.target.value))} min={1} />
        {erreurs.duree && <p style={{ color: 'red' }}>{erreurs.duree}</p>}
      </div>

      <div>
        <label>Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      </div>

      <button onClick={handleSubmit}>Créer le cocktail</button>
      {erreurs.global && <p style={{ color: 'red' }}>{erreurs.global}</p>}
    </div>
  );
}

export default AjouterCocktail;
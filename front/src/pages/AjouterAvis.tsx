import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function AjouterAvis() {
  const { nom } = useParams();
  const [note, setNote] = useState(5);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const err: Record<string, string> = {};
    if (titre.trim().length < 3) err.titre = "Le titre doit faire au moins 3 caractères";
    if (description.trim().length < 10) err.description = "La description doit faire au moins 10 caractères";
    if (Object.keys(err).length > 0) { setErreurs(err); return; }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      // On a besoin de l'idcocktail, on récupère le cocktail par son nom
      const cocktail = await axios.get(`/api/cocktail/${encodeURIComponent(nom!)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await axios.post(`/api/avis/${cocktail.data.idcocktail}`, {
        noteavis: note,
        titreavis: titre,
        descriptionavis: description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate(`/cocktail/${encodeURIComponent(nom!)}`);
    } catch (err: any) {
      setErreurs({ global: err.response?.data?.message || "Erreur lors de l'ajout de l'avis" });
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Retour</button>
      <h1>⭐ Laisser un avis sur {nom}</h1>

      <div>
        <label>Note</label>
        <select value={note} onChange={(e) => setNote(parseInt(e.target.value))}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} ⭐</option>
          ))}
        </select>
      </div>

      <div>
        <label>Titre</label>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre de votre avis" />
        {erreurs.titre && <p style={{ color: 'red' }}>{erreurs.titre}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Votre avis..." />
        {erreurs.description && <p style={{ color: 'red' }}>{erreurs.description}</p>}
      </div>

      <button onClick={handleSubmit}>Publier l'avis</button>
      {erreurs.global && <p style={{ color: 'red' }}>{erreurs.global}</p>}
    </div>
  );
}

export default AjouterAvis;
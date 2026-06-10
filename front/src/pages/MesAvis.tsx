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
  const [editId, setEditId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState(5);
  const [editTitre, setEditTitre] = useState("");
  const [editDescription, setEditDescription] = useState("");
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

  const handleModifier = (a: Avis) => {
    setEditId(a.idavis);
    setEditNote(a.noteavis);
    setEditTitre(a.titreavis);
    setEditDescription(a.descriptionavis);
  };

  const handleSauvegarder = async () => {
    const token = localStorage.getItem("token");
    await axios.put(`/api/avis/${editId}`, {
      noteavis: editNote,
      titreavis: editTitre,
      descriptionavis: editDescription,
    }, { headers: { Authorization: `Bearer ${token}` } });

    setAvis(avis.map((a) => a.idavis === editId
      ? { ...a, noteavis: editNote, titreavis: editTitre, descriptionavis: editDescription }
      : a
    ));
    setEditId(null);
  };

  const handleSupprimer = async (idavis: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`/api/avis/${idavis}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAvis(avis.filter((a) => a.idavis !== idavis));
  };

  return (
    <div>
      <button onClick={() => navigate("/compte")}>← Retour</button>
      <h1>Mes avis</h1>
      {avis.length === 0 && <p>Aucun avis posté.</p>}
      {avis.map((a) => (
        <div key={a.idavis} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          {editId === a.idavis ? (
            <div>
              <select value={editNote} onChange={(e) => setEditNote(parseInt(e.target.value))}>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}/5</option>)}
              </select>
              <input value={editTitre} onChange={(e) => setEditTitre(e.target.value)} />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              <button onClick={handleSauvegarder}>Sauvegarder</button>
              <button onClick={() => setEditId(null)} style={{ marginLeft: '10px' }}>Annuler</button>
            </div>
          ) : (
            <div>
              <p>{a.noteavis}/5 — <strong>{a.titreavis}</strong></p>
              <p>{a.descriptionavis}</p>
              <p>Cocktail : <span onClick={() => navigate(`/cocktail/${encodeURIComponent(a.cocktail.nomcocktail)}`)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{a.cocktail.nomcocktail}</span></p>
              <p>{new Date(a.dateavis).toLocaleDateString()}</p>
              <button onClick={() => handleModifier(a)}>Modifier</button>
              <button onClick={() => handleSupprimer(a.idavis)} style={{ color: 'red', marginLeft: '10px' }}>Supprimer</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MesAvis;
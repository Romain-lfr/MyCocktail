import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ModifierCompte() {
  const [pseudo, setPseudo] = useState("");
  const [mailcompte, setMail] = useState("");
  const [numtel, setNumtel] = useState("");
  const [datenaissance, setDatenaissance] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [succes, setSucces] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios.get("/api/compte/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setPseudo(res.data.pseudo);
      setMail(res.data.mailcompte);
      setNumtel(res.data.numtel || "");
      setDatenaissance(res.data.datenaissance.split('T')[0]);
    }).catch(() => navigate("/login"));
  }, []);

  const valider = () => {
    const err: Record<string, string> = {};
    if (pseudo.trim().length < 3) err.pseudo = "Le pseudo doit faire au moins 3 caractères";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailcompte)) err.mail = "Email invalide";
    if (numtel && !/^\+?[\d\s\-]{7,20}$/.test(numtel)) err.numtel = "Numéro de téléphone invalide";
    if (!datenaissance) err.datenaissance = "Date de naissance obligatoire";
    else if (new Date(datenaissance) >= new Date()) err.datenaissance = "La date doit être dans le passé";
    return err;
  };

  const handleSubmit = async () => {
    const err = valider();
    if (Object.keys(err).length > 0) { setErreurs(err); return; }

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    try {
      await axios.put("/api/compte/me", {
        pseudo,
        mailcompte,
        numtel: numtel || null,
        datenaissance,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSucces("Profil mis à jour !");
      setErreurs({});
    } catch (err: any) {
      setErreurs({ global: err.response?.data?.message || "Erreur lors de la modification" });
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/compte/info")}>← Retour</button>
      <h1>Modifier mon profil</h1>

      <div>
        <label>Pseudo</label>
        <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
        {erreurs.pseudo && <p style={{ color: 'red' }}>{erreurs.pseudo}</p>}
      </div>

      <div>
        <label>Email</label>
        <input value={mailcompte} onChange={(e) => setMail(e.target.value)} />
        {erreurs.mail && <p style={{ color: 'red' }}>{erreurs.mail}</p>}
      </div>

      <div>
        <label>Téléphone (optionnel)</label>
        <input value={numtel} onChange={(e) => setNumtel(e.target.value)} placeholder="+33 6 00 00 00 00" />
        {erreurs.numtel && <p style={{ color: 'red' }}>{erreurs.numtel}</p>}
      </div>

      <div>
        <label>Date de naissance</label>
        <input type="date" value={datenaissance} onChange={(e) => setDatenaissance(e.target.value)} />
        {erreurs.datenaissance && <p style={{ color: 'red' }}>{erreurs.datenaissance}</p>}
      </div>

      <button onClick={handleSubmit}>Sauvegarder</button>
      {succes && <p style={{ color: 'green' }}>{succes}</p>}
      {erreurs.global && <p style={{ color: 'red' }}>{erreurs.global}</p>}
    </div>
  );
}

export default ModifierCompte;
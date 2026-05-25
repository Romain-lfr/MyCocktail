import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [pseudo, setPseudo] = useState("");
  const [mail, setMail] = useState("");
  const [mdp, setMdp] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [confirmMdp, setConfirmMdp] = useState("");

  const valider = () => {
    const err: Record<string, string> = {};

    if (pseudo.trim().length < 3)
      err.pseudo = "Le pseudo doit faire au moins 3 caractères";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      err.mail = "Email invalide";

    if (mdp.length < 8)
      err.mdp = "Le mot de passe doit faire au moins 8 caractères";
    else if (!/[A-Z]/.test(mdp))
      err.mdp = "Le mot de passe doit contenir au moins une majuscule";
    else if (!/[0-9]/.test(mdp))
      err.mdp = "Le mot de passe doit contenir au moins un chiffre";
    else if (mdp !== confirmMdp)
        err.confirmMdp = "Les mots de passe ne correspondent pas";

    if (!dateNaissance)
      err.dateNaissance = "La date de naissance est obligatoire";
    else if (new Date(dateNaissance) >= new Date())
      err.dateNaissance = "La date de naissance doit être dans le passé";

    return err;
  };

  const handleRegister = async () => {
    const err = valider();
    if (Object.keys(err).length > 0) {
      setErreurs(err);
      return;
    }

    try {
      await axios.post("/api/auth/register", {
        pseudo,
        mail,
        mdp,
        dateNaissance,
      });
      navigate("/login");
    } catch (err: any) {
        if (err.response?.data?.message) {
            setErreurs({ global: err.response.data.message });
        } else {
            setErreurs({ global: "Erreur lors de la création du compte" });
        }
    }
  };

  return (
    <div>
      <h1>Créer un compte</h1>

      <input
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      {erreurs.pseudo && <p style={{ color: "red" }}>{erreurs.pseudo}</p>}

      <input
        placeholder="Email"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
      />
      {erreurs.mail && <p style={{ color: "red" }}>{erreurs.mail}</p>}

      <input
        type="password"
        placeholder="Mot de passe"
        value={mdp}
        onChange={(e) => setMdp(e.target.value)}
      />
      {erreurs.mdp && <p style={{ color: "red" }}>{erreurs.mdp}</p>}

      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmMdp}
        onChange={(e) => setConfirmMdp(e.target.value)}
      />
      {erreurs.confirmMdp && <p style={{ color: "red" }}>{erreurs.confirmMdp}</p>}

      <input
        type="date"
        value={dateNaissance}
        onChange={(e) => setDateNaissance(e.target.value)}
      />
      {erreurs.dateNaissance && <p style={{ color: "red" }}>{erreurs.dateNaissance}</p>}

      <button onClick={handleRegister}>Créer mon compte</button>
      {erreurs.global && <p style={{ color: "red" }}>{erreurs.global}</p>}
    </div>
  );
}

export default Register;
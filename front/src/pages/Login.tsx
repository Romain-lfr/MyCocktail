import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [pseudo, setPseudo] = useState("");
    const [mdp, setMdp] = useState("");
    const [erreur, setErreur] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("/api/auth/login", {
                pseudo,
                mdp,
            });
            localStorage.setItem("token", res.data.access_token);
            localStorage.setItem("estMineur", res.data.estMineur);
            navigate("/");
        } catch (err) {
            setErreur("Pseudo ou mot de passe incorrect");
        }
    };

    return (
        <div>
            <h1>Connexion</h1>
            <input
                placeholder="Pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
            />
            <button onClick={handleLogin}>Se connecter</button>
            {erreur && <p>{erreur}</p>}
        </div>
    );
}

export default Login;
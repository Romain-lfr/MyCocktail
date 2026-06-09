import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [recherche, setRecherche] = useState("");

  const handleRecherche = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && recherche.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(recherche.trim())}`);
      setRecherche("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("estMineur");
    navigate("/login");
  };

  return (
    <header style={{ display: 'flex', gap: '20px', padding: '10px', borderBottom: '1px solid #ccc', alignItems: 'center' }}>
      <button onClick={() => navigate("/frigo")}>Frigo</button>
      <button onClick={() => navigate("/")}>Home</button>
      <button onClick={() => window.location.href = "/?alcool=false"}>Mocktails</button>
      <button onClick={() => window.location.href = "/?alcool=true"}>Cocktails</button>
      <input
        placeholder="Rechercher..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        onKeyDown={handleRecherche}
        style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      {token ? (
        <>
          <button onClick={() => navigate("/compte")}>Mon compte</button>
          <button onClick={handleLogout}>Se déconnecter</button>
        </>
      ) : (
        <button onClick={() => navigate("/login")}>Connexion</button>
      )}
    </header>
  );
}

export default Header;
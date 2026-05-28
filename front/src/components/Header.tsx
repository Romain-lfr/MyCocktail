import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("estMineur");
    navigate("/login");
  };

  return (
    <header style={{ display: 'flex', gap: '20px', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => navigate("/frigo")}>Frigo</button>
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => window.location.href = "/?alcool=false"}>Mocktails</button>
        <button onClick={() => window.location.href = "/?alcool=true"}>Cocktails</button>
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
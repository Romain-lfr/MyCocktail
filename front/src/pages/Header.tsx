import { useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo.tsx";
import "./mycocktail.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const connecte = !!localStorage.getItem("token");
  const estMineur = localStorage.getItem("estMineur") === "true";
  const alcool = new URLSearchParams(location.search).get("alcool");

  const rechercher = (e: FormEvent) => {
    e.preventDefault();
    const terme = q.trim();
    if (terme) navigate(`/recherche?q=${encodeURIComponent(terme)}`);
  };

  const deconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("estMineur");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="logo" aria-label="MyCocktail, accueil"><Logo /></Link>

        <nav className="nav" aria-label="Navigation principale">
          <NavLink to="/" end aria-current={!alcool && location.pathname === "/" ? "page" : undefined}>Tous</NavLink>
          <Link to="/?alcool=false" aria-current={alcool === "false" ? "page" : undefined}>Sans alcool</Link>
          {!estMineur && <Link to="/?alcool=true" aria-current={alcool === "true" ? "page" : undefined}>Avec alcool</Link>}
          {connecte && <Link to="/compte/frigo">Mon frigo</Link>}
        </nav>

        <form className="header__search" onSubmit={rechercher} role="search">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un cocktail" aria-label="Rechercher un cocktail" />
        </form>

        <div className="header__actions">
          {connecte ? (
            <>
              <Link to="/compte" className="pill">Mon compte</Link>
              <button className="pill pill--mangue" onClick={deconnexion}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login" className="pill">Connexion</Link>
              <Link to="/register" className="pill pill--mangue">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
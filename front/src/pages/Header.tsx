import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo.tsx";
import "./myxo.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const connecte = !!localStorage.getItem("token");
  const estMineur = localStorage.getItem("estMineur") === "true";
  const alcool = new URLSearchParams(location.search).get("alcool");

  // Hauteur réelle du header (une ligne sur ordinateur, plusieurs sur mobile) exposée en CSS :
  // le contenu remplit au moins tout l'écran sous le header, le footer n'apparaît qu'en défilant.
  const refHeader = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = refHeader.current;
    if (!header) return;
    const mesurer = () =>
      document.documentElement.style.setProperty("--hauteur-header", `${header.offsetHeight}px`);
    mesurer();
    if (typeof ResizeObserver === "undefined") return;
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(header);
    return () => observateur.disconnect();
  }, []);

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
    <header className="header" ref={refHeader}>
      <div className="header__inner">
        <Link to="/" className="logo" aria-label="Myxo, accueil"><Logo /></Link>

        <nav className="nav" aria-label="Navigation principale">
          {/* Link et non NavLink : NavLink marquerait « Tous » actif même sur /?alcool=… */}
          <Link to="/" aria-current={!alcool && location.pathname === "/" ? "page" : undefined}>Tous</Link>
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
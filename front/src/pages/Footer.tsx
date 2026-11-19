import { Link } from "react-router-dom";
import Logo from "./Logo";
import "./mycocktail.css";

/** Pied de page commun à toutes les pages (affiché par App.tsx, comme le Header). */
export default function Footer() {
  const connecte = !!localStorage.getItem("token");
  const estMineur = localStorage.getItem("estMineur") === "true";
  const annee = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__haut">
          <div>
            <Link to="/" className="logo" aria-label="MyCocktail, accueil"><Logo /></Link>
            <p className="footer__slogan">Cocktails et mocktails à faire chez soi, avec ce qu'il y a dans le frigo.</p>
          </div>

          <nav aria-labelledby="footer-explorer">
            <h2 id="footer-explorer">Explorer</h2>
            <ul>
              <li><Link to="/">Toutes les recettes</Link></li>
              <li><Link to="/?alcool=false">Sans alcool</Link></li>
              {!estMineur && <li><Link to="/?alcool=true">Avec alcool</Link></li>}
            </ul>
          </nav>

          <nav aria-labelledby="footer-espace">
            <h2 id="footer-espace">Mon espace</h2>
            <ul>
              {connecte ? (
                <>
                  <li><Link to="/compte/frigo">Mon frigo</Link></li>
                  <li><Link to="/compte/cocktails">Mes cocktails</Link></li>
                  <li><Link to="/compte/favoris">Mes favoris</Link></li>
                  <li><Link to="/compte/avis">Mes avis</Link></li>
                  <li><Link to="/cocktail/ajouter">Ajouter un cocktail</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Connexion</Link></li>
                  <li><Link to="/register">Créer un compte</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>

        <div className="footer__bas">
          <p>© {annee} MyCocktail</p>
          <p>L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>
        </div>
      </div>
    </footer>
  );
}

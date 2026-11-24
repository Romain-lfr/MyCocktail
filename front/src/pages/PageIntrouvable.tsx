import { Link } from "react-router-dom";
import { GlasseY } from "./Logo";
import "./myxo.css";

// Page affichée pour toute URL inconnue (route "*" dans App.tsx)
export default function PageIntrouvable() {
  return (
    <main className="page">
      <div className="vide">
        <span className="vide__verre vide__verre--mangue" aria-hidden="true"><GlasseY /></span>
        <div>
          <h1 className="vide__titre">Page introuvable</h1>
          <p>Cette page n'existe pas ou a été déplacée. Le verre est vide, mais il reste plein de recettes à l'accueil.</p>
          <Link className="pill pill--mangue" to="/">Retour à l'accueil</Link>
        </div>
      </div>
    </main>
  );
}

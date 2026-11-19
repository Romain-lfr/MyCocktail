import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { GlasseY, GlasseU } from "./Logo";
import ImageOuSecours from "./ImageOuSecours";
import { libelleStatut } from "../utils/statut";
import "./mycocktail.css";
import { formatNote, noteMoyenne } from "../utils/format";

export interface RecetteResume {
  idcocktail: string;
  nomcocktail: string;
  description?: string;
  difficulte?: string;
  duree?: number;
  alcool?: boolean;
  statut?: string;
  image?: { urlimage: string; titleimage?: string }[];
  avis?: { noteavis: number }[];
}

/** Carte de recette (même rendu que l'accueil) ; les boutons d'action sont passés en enfants. */
export default function CarteRecette({ c, avecStatut = false, children }: { c: RecetteResume; avecStatut?: boolean; children?: ReactNode }) {
  const navigate = useNavigate();
  const image = c.image?.[0];
  const statut = avecStatut && c.statut ? libelleStatut(c.statut) : null;

  return (
    <li className="recette recette--cliquable" onClick={(e) => {
      // Toute la carte ouvre la fiche, sauf ses propres boutons (Modifier, Retirer…)
      if ((e.target as HTMLElement).closest("button, a")) return;
      navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`);
    }}>
      <div className="recette__corps">
        <h2>
          <button className="recette__nom" onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)}>
            {c.nomcocktail}
          </button>
        </h2>
        {c.description && <p className="recette__desc">{c.description}</p>}
        <div className="recette__meta">
          {statut && <span className={`etat etat--${statut.toLowerCase()}`}>{statut}</span>}
          {c.difficulte && <span className={`statut statut--${c.difficulte}`}>{c.difficulte}</span>}
          {c.duree !== undefined && <span>{c.duree} min</span>}
          {c.avis && (
            <span>{c.avis.length > 0
              ? `${formatNote(noteMoyenne(c.avis))}/5 (${c.avis.length} avis)`
              : "Aucun avis"}</span>
          )}
          {c.alcool !== undefined && (
            <span className={`tag ${c.alcool ? "tag--alcool" : ""}`}>{c.alcool ? "Alcool" : "Sans alcool"}</span>
          )}
        </div>
      </div>

      {children && <div className="recette__actions">{children}</div>}

      <ImageOuSecours
        className="recette__visuel"
        src={image && `/api${image.urlimage}`}
        alt={image?.titleimage || c.nomcocktail}
        secours={
          <div className={`recette__visuel recette__visuel--vide ${c.alcool ? "recette__visuel--alcool" : "recette__visuel--moktail"}`} aria-hidden="true">
            {c.alcool ? <GlasseY /> : <GlasseU />}
          </div>
        }
      />
    </li>
  );
}

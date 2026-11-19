import { useState, type ReactNode } from "react";

// Affiche l'image si elle existe et se charge ; sinon (pas d'URL, fichier
// introuvable, erreur réseau) affiche le visuel de secours (verre Y / U…).
export default function ImageOuSecours({ src, alt, className, secours }: {
  src?: string | null;
  alt: string;
  className?: string;
  secours: ReactNode;
}) {
  // On retient l'URL en échec : si l'URL change, on retente le chargement
  const [echec, setEchec] = useState<string | null>(null);

  if (!src || echec === src) return <>{secours}</>;
  return <img className={className} src={src} alt={alt} onError={() => setEchec(src)} />;
}

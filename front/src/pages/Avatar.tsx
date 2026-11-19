import { initiales } from "../utils/initiales";
import ImageOuSecours from "./ImageOuSecours";

// Photo de profil, ou initiales du pseudo si pas de photo (ou photo introuvable).
// `photo` : chemin renvoyé par l'API (ex. « /public/images/x.webp »).
export default function Avatar({ pseudo, photo, className }: {
  pseudo: string | null | undefined;
  photo?: string | null;
  className: string;
}) {
  return (
    <ImageOuSecours
      src={photo ? `/api${photo}` : null}
      alt=""
      className={`${className} avatar__photo`}
      secours={<span className={className} aria-hidden="true">{initiales(pseudo)}</span>}
    />
  );
}

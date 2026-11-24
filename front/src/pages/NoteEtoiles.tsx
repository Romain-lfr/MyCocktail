import "./myxo.css";

const LIBELLES_NOTE = ["", "Décevant", "Bof", "Correct", "Très bon", "Excellent"];

/** Note de 1 à 5 en étoiles : boutons radio cachés, étoiles cliquables, utilisable au clavier. */
export default function NoteEtoiles({ valeur, onChange, nom = "note", legende = "Ta note" }: {
  valeur: number;
  onChange: (n: number) => void;
  nom?: string;
  legende?: string;
}) {
  return (
    <fieldset className="etoiles">
      <legend>{legende}</legend>
      <div className="etoiles__liste">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`etoiles__etoile ${n <= valeur ? "etoiles__etoile--pleine" : ""}`}>
            <input type="radio" name={nom} value={n} checked={valeur === n} onChange={() => onChange(n)} className="sr-only" />
            <span aria-hidden="true">★</span>
            <span className="sr-only">{n} sur 5 — {LIBELLES_NOTE[n]}</span>
          </label>
        ))}
        <span className="etoiles__libelle" aria-hidden="true">{valeur}/5 · {LIBELLES_NOTE[valeur]}</span>
      </div>
    </fieldset>
  );
}

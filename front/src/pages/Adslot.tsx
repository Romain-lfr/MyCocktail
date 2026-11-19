import { useEffect, useRef } from "react";
import { CLIENT_ADSENSE as CLIENT, estMineur } from "../utils/pub";
import "./mycocktail.css";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

// Le script AdSense n'est chargé que si une pub va réellement s'afficher
function chargerScript() {
  if (!CLIENT || document.querySelector("script[data-adsense]")) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.dataset.adsense = "true";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
}

export default function AdSlot({ slot, format = "auto" }: { slot?: string; format?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const actif = !!CLIENT && !!slot && !estMineur();

  useEffect(() => {
    if (!actif) return;
    chargerScript();
    const el = ref.current;
    // Évite l'erreur « All ins elements already have ads » (React StrictMode / re-render)
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense :", e);
    }
  }, [actif]);

  if (estMineur()) return null;

  if (!actif) {
    return import.meta.env.DEV ? (
      <div className="pub__dev">Emplacement publicitaire (visible uniquement en développement)</div>
    ) : null;
  }

  return (
    <div className="pub__contenu">
      <span className="pub__label">Publicité</span>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
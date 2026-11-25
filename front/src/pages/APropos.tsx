import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GlasseU, GlasseY } from "./Logo";
import "./myxo.css";

const DEPOT = "Romain-lfr/Myxo";
const CONTACT = "lefranc.romain@outlook.fr";
// Membres de l'équipe : retirés de la liste des contributeurs pour ne pas apparaître deux fois
const EQUIPE = [
  { login: "Romain-lfr", nom: "Romain", role: "Fondateur et développeur" },
];

const ETAPES = [
  { titre: "Remplis ton frigo", texte: "Note les bouteilles, jus et sirops que tu as sous la main." },
  { titre: "Myxo trouve quoi servir", texte: "Il te propose les cocktails et mocktails réalisables avec ce que tu as." },
  { titre: "Secoue, note, partage", texte: "Suis la recette étape par étape, garde tes favoris, laisse ton avis ou publie tes créations." },
];

const HISTORIQUE = `https://github.com/${DEPOT}/commits/main`;
// Après la tuile « Nouveautés » (01), qui ouvre la liste des derniers commits
const LIENS = [
  { href: `mailto:${CONTACT}`, titre: "Contacter l'équipe", texte: CONTACT },
  { href: `https://github.com/${DEPOT}`, titre: "Code source", texte: `${DEPOT} sur GitHub` },
];

interface Contributeur { login: string; avatar_url: string; html_url: string; type: string }
interface Commit { sha: string; html_url: string; commit: { message: string; author: { date: string } } }

const NB_NOUVEAUTES = 5;
// « 25 novembre 2026 »
const dateCommit = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
// Titre du commit : sa première ligne (le corps et les mentions de co-auteurs sont ignorés)
const titreCommit = (message: string) => message.split("\n")[0].trim();

const externe = (href: string) => href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

export default function APropos() {
  const [contributeurs, setContributeurs] = useState<Contributeur[] | null>(null);
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [nouveautesOuvertes, setNouveautesOuvertes] = useState(false);
  // Commit déployé (fourni par le workflow GitHub Actions), « dev » en local
  const build = (import.meta.env.VITE_BUILD ?? "").slice(0, 7) || "dev";

  useEffect(() => {
    const membres = EQUIPE.map((m) => m.login.toLowerCase());
    axios.get(`https://api.github.com/repos/${DEPOT}/contributors`)
      .then((res) => setContributeurs((Array.isArray(res.data) ? res.data as Contributeur[] : [])
        .filter((c) => c.type !== "Bot" && !membres.includes(c.login.toLowerCase()))))
      .catch(() => setContributeurs([]));
  }, []);

  // Derniers commits : chargés au premier clic sur « Nouveautés » seulement
  const basculerNouveautes = () => {
    setNouveautesOuvertes((o) => !o);
    if (commits !== null) return;
    axios.get(`https://api.github.com/repos/${DEPOT}/commits`, { params: { per_page: NB_NOUVEAUTES } })
      .then((res) => setCommits((Array.isArray(res.data) ? res.data as Commit[] : [])
        .filter((c) => c?.commit?.message && c.commit.author?.date)
        .slice(0, NB_NOUVEAUTES)))
      .catch(() => setCommits([]));
  };

  return (
    <main className="page apropos">
      {/* Ouverture : le titre, et l'équipe sur une carte inclinée */}
      <section className="apropos-hero">
        <div>
          <p className="surtitre">À propos</p>
          <h1>Le bar à la maison, <em>sans prise de tête</em>.</h1>
          <p className="apropos-hero__texte">
            Myxo t'aide à créer et explorer des recettes de cocktails et de mocktails.
            Dis ce qu'il y a dans ton frigo, Myxo te dit quoi secouer.
          </p>
          <div className="apropos-hero__meta">
            <span className="badge-beta" title="Le site est en cours de développement">Bêta</span>
            <span className="apropos-hero__build">build {build}</span>
          </div>
          <Link to="/" className="pill pill--mangue apropos-hero__cta">Découvrir les recettes</Link>
        </div>

        <aside className="apropos-carte" aria-labelledby="apropos-equipe">
          <span className="apropos-carte__verre apropos-carte__verre--y" aria-hidden="true"><GlasseY /></span>
          <span className="apropos-carte__verre apropos-carte__verre--u" aria-hidden="true"><GlasseU /></span>
          <p className="apropos-carte__sous">Derrière le bar</p>
          <h2 id="apropos-equipe">Équipe</h2>
          <ul className="apropos-membres">
            {EQUIPE.map((m) => (
              <li key={m.login}>
                <a href={`https://github.com/${m.login}`} target="_blank" rel="noopener noreferrer">
                  <img src={`https://github.com/${m.login}.png?size=160`} alt="" width={80} height={80} />
                  <span>
                    <span className="apropos-membres__nom">{m.nom}</span>
                    <span className="apropos-membres__pseudo">@{m.login}<span className="sr-only"> sur GitHub (nouvel onglet)</span></span>
                    <span className="apropos-membres__role">{m.role}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="apropos-carte__contributeurs" role="region" aria-labelledby="apropos-contributeurs">
            <h3 id="apropos-contributeurs">Contributeurs</h3>
            {contributeurs === null ? (
              <p className="apropos-merci">Chargement…</p>
            ) : contributeurs.length === 0 ? (
              <p className="apropos-merci">Pas encore d'autres contributeurs. Le code est ouvert : la prochaine pilule ici, c'est peut-être toi.</p>
            ) : (
              <>
                <ul className="contributeurs">
                  {contributeurs.map((c) => (
                    <li key={c.login}>
                      <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                        <img src={c.avatar_url} alt="" width={32} height={32} loading="lazy" />
                        {c.login}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="apropos-merci">Merci à tous ceux qui ont contribué au code.</p>
              </>
            )}
            <a className="pill apropos-contribuer" href={`https://github.com/${DEPOT}`} target="_blank" rel="noopener noreferrer">
              Contribuer sur GitHub<span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>
        </aside>
      </section>

      {/* Comment ça marche */}
      <section className="apropos-bloc" aria-labelledby="apropos-etapes">
        <h2 id="apropos-etapes">Comment ça marche</h2>
        <ol className="apropos-etapes">
          {ETAPES.map((e, i) => (
            <li key={e.titre}>
              <span className="apropos-etapes__num" aria-hidden="true">{i + 1}</span>
              <h3>{e.titre}</h3>
              <p>{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bande sable : garder le contact */}
      <section className="apropos-bande apropos-bande--fin" aria-labelledby="apropos-contact">
        <h2 id="apropos-contact">Garder le contact</h2>
        <ul className="espace apropos-liens">
          <li>
            <button type="button" className="espace__bouton" onClick={basculerNouveautes}
              aria-expanded={nouveautesOuvertes} aria-controls="apropos-nouveautes">
              <span className="espace__num" aria-hidden="true">01</span>
              <span className="espace__titre">Nouveautés</span>
              <span className="espace__texte">Ce qui a changé récemment</span>
              <span className="espace__fleche" aria-hidden="true">↓</span>
            </button>
          </li>
          {LIENS.map((l, i) => (
            <li key={l.titre}>
              <a href={l.href} {...externe(l.href)}>
                <span className="espace__num" aria-hidden="true">{String(i + 2).padStart(2, "0")}</span>
                <span className="espace__titre">{l.titre}</span>
                <span className="espace__texte">{l.texte}</span>
                {l.href.startsWith("http") && <span className="sr-only"> (nouvel onglet)</span>}
                <span className="espace__fleche" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Derniers commits, ouverts par la tuile « Nouveautés » */}
        <div id="apropos-nouveautes" className="apropos-nouveautes" role="region" aria-label="Nouveautés" hidden={!nouveautesOuvertes}>
          {commits === null ? (
            <p className="apropos-merci">Chargement…</p>
          ) : commits.length === 0 ? (
            <p className="apropos-merci">Impossible de charger les nouveautés pour le moment.</p>
          ) : (
            <ol className="apropos-commits">
              {commits.map((c) => (
                <li key={c.sha}>
                  <time dateTime={c.commit.author.date}>{dateCommit(c.commit.author.date)}</time>
                  <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                    {titreCommit(c.commit.message)}<span className="sr-only"> (nouvel onglet)</span>
                  </a>
                  <span className="apropos-commits__sha" aria-hidden="true">{c.sha.slice(0, 7)}</span>
                </li>
              ))}
            </ol>
          )}
          <a className="pill apropos-commits__tout" href={HISTORIQUE} target="_blank" rel="noopener noreferrer">
            Voir tout l'historique<span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
      </section>

    </main>
  );
}

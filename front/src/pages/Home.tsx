import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { GlasseY, GlasseU } from "./Logo";
import AdSlot from "./Adslot";
import { pubAutorisee } from "../utils/pub";
import "./mycocktail.css";
import { avecToken, tokenSiConnecte } from "../utils/api";
import { formatNote, noteMoyenne } from "../utils/format";

interface Cocktail {
    idcocktail: string;
    nomcocktail: string;
    description: string;
    difficulte: string;
    alcool: boolean;
    duree: number;
    datecreation: string;
    image: { urlimage: string; titleimage: string }[];
    avis: { noteavis: number }[];
}

interface Option { id: string; nom: string }

const SLOT_LISTE = import.meta.env.VITE_ADSENSE_SLOT_LISTE as string | undefined;

/* Champ de recherche avec puces : sert pour les ingrédients et les ustensiles */
function SelecteurMultiple({ id, placeholder, options, selection, onChange }: {
    id: string;
    placeholder: string;
    options: Option[];
    selection: string[];
    onChange: (s: string[]) => void;
}) {
    const [texte, setTexte] = useState("");
    const propositions = texte
        ? options.filter((o) => !selection.includes(o.id) && o.nom.toLowerCase().includes(texte.toLowerCase())).slice(0, 8)
        : [];

    const ajouter = (optionId: string) => {
        onChange([...selection, optionId]);
        setTexte("");
    };

    return (
        <div className="selecteur">
            {selection.map((sid) => {
                const nom = options.find((o) => o.id === sid)?.nom;
                return (
                    <span key={sid} className="puce">
                        {nom}
                        <button type="button" aria-label={`Retirer ${nom}`} onClick={() => onChange(selection.filter((f) => f !== sid))}>×</button>
                    </span>
                );
            })}
            <div className="selecteur__champ">
                <input
                    id={id}
                    aria-label={placeholder}
                    placeholder={placeholder}
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && propositions[0]) {
                            e.preventDefault();
                            ajouter(propositions[0].id);
                        }
                    }}
                />
                {propositions.length > 0 && (
                    <ul className="suggestions">
                        {propositions.map((p) => (
                            <li key={p.id}><button type="button" onClick={() => ajouter(p.id)}>{p.nom}</button></li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function Home() {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [favoris, setFavoris] = useState<string[]>([]);
    const [affiner, setAffiner] = useState(false);
    const [tri, setTri] = useState(() => sessionStorage.getItem("tri") || "date_desc");
    const [filtreDifficulte, setFiltreDifficulte] = useState(() => sessionStorage.getItem("filtreDifficulte") || "");
    const [filtreDureeMin, setFiltreDureeMin] = useState(() => parseInt(sessionStorage.getItem("filtreDureeMin") || "0"));
    const [filtreDureeMax, setFiltreDureeMax] = useState(() => parseInt(sessionStorage.getItem("filtreDureeMax") || "0"));
    const [filtreNoteMin, setFiltreNoteMin] = useState(() => parseInt(sessionStorage.getItem("filtreNoteMin") || "0"));
    const [filtreNoteMax, setFiltreNoteMax] = useState(() => parseInt(sessionStorage.getItem("filtreNoteMax") || "0"));
    const [filtreIngredients, setFiltreIngredients] = useState<string[]>(() => JSON.parse(sessionStorage.getItem("filtreIngredients") || "[]"));
    const [filtreUstensiles, setFiltreUstensiles] = useState<string[]>(() => JSON.parse(sessionStorage.getItem("filtreUstensiles") || "[]"));
    const [listeIngredients, setListeIngredients] = useState<{ idingredient: string; nomingredient: string }[]>([]);
    const [listeUstensiles, setListeUstensiles] = useState<{ idustensile: string; nomustensile: string }[]>([]);

    const token = localStorage.getItem("token");
    const estMineur = localStorage.getItem("estMineur") === "true";
    const alcoolParam = searchParams.get("alcool");

    useEffect(() => {
        sessionStorage.setItem("tri", tri);
        sessionStorage.setItem("filtreDifficulte", filtreDifficulte);
        sessionStorage.setItem("filtreDureeMin", filtreDureeMin.toString());
        sessionStorage.setItem("filtreDureeMax", filtreDureeMax.toString());
        sessionStorage.setItem("filtreNoteMin", filtreNoteMin.toString());
        sessionStorage.setItem("filtreNoteMax", filtreNoteMax.toString());
        sessionStorage.setItem("filtreIngredients", JSON.stringify(filtreIngredients));
        sessionStorage.setItem("filtreUstensiles", JSON.stringify(filtreUstensiles));
    }, [tri, filtreDifficulte, filtreDureeMin, filtreDureeMax, filtreNoteMin, filtreNoteMax, filtreIngredients, filtreUstensiles]);

    useEffect(() => {
        axios.get("/api/cocktail/listes/ingredients").then((res) => setListeIngredients(res.data));
        axios.get("/api/cocktail/listes/ustensiles").then((res) => setListeUstensiles(res.data));
    }, []);

    useEffect(() => {
        if (!token) return;
        axios.get("/api/compte/mes-favoris", avecToken()).then((res) => setFavoris(res.data.map((f: { idcocktail: string }) => f.idcocktail)));
    }, []);

    useEffect(() => {
        if (searchParams.get("q")) return;

        const params = new URLSearchParams();

        if (alcoolParam === "true") {
            if (!token) { navigate("/login"); return; }
            params.set("alcool", estMineur ? "false" : "true");
        } else if (alcoolParam === "false" || !token || estMineur) {
            params.set("alcool", "false");
        }

        if (filtreIngredients.length > 0) params.set("ingredients", filtreIngredients.join(","));
        if (filtreUstensiles.length > 0) params.set("ustensiles", filtreUstensiles.join(","));

        const query = params.toString();
        const url = `/api/cocktail${query ? `?${query}` : ""}`;

        axios.get(url, tokenSiConnecte())
            .then((res) => setCocktails(res.data))
            .catch((err) => {
                console.error(err);
                if (token) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("estMineur");
                    navigate("/login");
                }
            });
    }, [searchParams, location, filtreIngredients, filtreUstensiles]);

    const toggleFavori = async (idcocktail: string) => {
        if (!token) { navigate("/login"); return; }
        if (favoris.includes(idcocktail)) {
            await axios.delete(`/api/compte/favori/${idcocktail}`, avecToken());
            setFavoris(favoris.filter((id) => id !== idcocktail));
        } else {
            await axios.post(`/api/compte/favori/${idcocktail}`, {}, avecToken());
            setFavoris([...favoris, idcocktail]);
        }
    };

    // Filtres de la barre et du panneau « Affiner » (pas les ingrédients du frigo ni le tri)
    const effacerFiltres = () => {
        setFiltreDifficulte("");
        setFiltreDureeMin(0);
        setFiltreDureeMax(0);
        setFiltreNoteMin(0);
        setFiltreNoteMax(0);
        setFiltreUstensiles([]);
    };

    const reinitialiser = () => {
        ["tri", "filtreDifficulte", "filtreDureeMin", "filtreDureeMax", "filtreNoteMin", "filtreNoteMax", "filtreIngredients", "filtreUstensiles"]
            .forEach((k) => sessionStorage.removeItem(k));
        effacerFiltres();
        setTri("date_desc");
        setFiltreIngredients([]);
    };

    const filtresActifs: { cle: string; libelle: string; retirer: () => void }[] = [
        ...(filtreDifficulte ? [{ cle: "diff", libelle: filtreDifficulte, retirer: () => setFiltreDifficulte("") }] : []),
        ...(filtreDureeMin ? [{ cle: "dmin", libelle: `≥ ${filtreDureeMin} min`, retirer: () => setFiltreDureeMin(0) }] : []),
        ...(filtreDureeMax ? [{ cle: "dmax", libelle: `≤ ${filtreDureeMax} min`, retirer: () => setFiltreDureeMax(0) }] : []),
        ...(filtreNoteMin ? [{ cle: "nmin", libelle: `Note ≥ ${filtreNoteMin}`, retirer: () => setFiltreNoteMin(0) }] : []),
        ...(filtreNoteMax ? [{ cle: "nmax", libelle: `Note ≤ ${filtreNoteMax}`, retirer: () => setFiltreNoteMax(0) }] : []),
        ...filtreUstensiles.map((id) => ({
            cle: id,
            libelle: listeUstensiles.find((u) => u.idustensile === id)?.nomustensile ?? id,
            retirer: () => setFiltreUstensiles(filtreUstensiles.filter((u) => u !== id)),
        })),
    ];

    // Quelques ingrédients proposés en un clic tant que le frigo est vide
    const idees = filtreIngredients.length === 0 ? listeIngredients.slice(0, 5) : [];

    const getMoyenne = (c: Cocktail) => noteMoyenne(c.avis);

    const cocktailsTries = [...cocktails]
        .filter((c) => !filtreDifficulte || c.difficulte === filtreDifficulte)
        .filter((c) => !filtreDureeMin || c.duree >= filtreDureeMin)
        .filter((c) => !filtreDureeMax || (filtreDureeMax >= filtreDureeMin && c.duree <= filtreDureeMax))
        .filter((c) => !filtreNoteMin || getMoyenne(c) >= filtreNoteMin)
        .filter((c) => !filtreNoteMax || (filtreNoteMax >= filtreNoteMin && getMoyenne(c) <= filtreNoteMax))
        .sort((a, b) => {
            const ordre = { "Facile": 1, "Moyen": 2, "Difficile": 3 };
            switch (tri) {
                case "note_desc": return getMoyenne(b) - getMoyenne(a);
                case "note_asc": return getMoyenne(a) - getMoyenne(b);
                case "duree_asc": return a.duree - b.duree;
                case "duree_desc": return b.duree - a.duree;
                case "diff_asc": return ordre[a.difficulte as keyof typeof ordre] - ordre[b.difficulte as keyof typeof ordre];
                case "diff_desc": return ordre[b.difficulte as keyof typeof ordre] - ordre[a.difficulte as keyof typeof ordre];
                case "date_asc": return new Date(a.datecreation).getTime() - new Date(b.datecreation).getTime();
                default: return new Date(b.datecreation).getTime() - new Date(a.datecreation).getTime();
            }
        });

    // Recette mise en avant : la mieux notée parmi les résultats, retirée de la liste
    const vedette = cocktailsTries.length === 0 ? null : [...cocktailsTries].sort((a, b) =>
        getMoyenne(b) - getMoyenne(a) || new Date(b.datecreation).getTime() - new Date(a.datecreation).getTime()
    )[0];
    const liste = cocktailsTries.filter((c) => c.idcocktail !== vedette?.idcocktail);

    const n = cocktailsTries.length;
    const portee = alcoolParam === "false" ? " sans alcool" : alcoolParam === "true" ? " avec alcool" : "";

    return (
        <>
            <main className="page">
                <section className="frigo">
                    <div>
                        <p className="surtitre">Le bar à la maison</p>
                        <h1>Qu'est-ce qu'on a dans le <em>frigo</em> ?</h1>
                        <p className="frigo__intro">Dis-nous ce que tu as sous la main, on te dit quoi secouer.</p>
                        <div className="frigo__ligne">
                            <span className="frigo__label">J'ai</span>
                            <SelecteurMultiple
                                id="ingredients"
                                placeholder="Ajouter un ingrédient"
                                options={listeIngredients.map((i) => ({ id: i.idingredient, nom: i.nomingredient }))}
                                selection={filtreIngredients}
                                onChange={setFiltreIngredients}
                            />
                        </div>
                        {idees.length > 0 && (
                            <div className="frigo__idees">
                                <span>Pour commencer :</span>
                                {idees.map((i) => (
                                    <button key={i.idingredient} type="button" className="pill pill--petite" aria-label={`Ajouter ${i.nomingredient}`}
                                        onClick={() => setFiltreIngredients([i.idingredient])}>
                                        <span aria-hidden="true">+</span> {i.nomingredient}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {vedette && (
                        <button className="vedette" onClick={() => navigate(`/cocktail/${encodeURIComponent(vedette.nomcocktail)}`)}>
                            {vedette.image[0] ? (
                                <img className="vedette__visuel" src={`/api${vedette.image[0].urlimage}`} alt="" />
                            ) : (
                                <span className={`vedette__visuel vedette__visuel--vide ${vedette.alcool ? "recette__visuel--alcool" : "recette__visuel--moktail"}`} aria-hidden="true">
                                    {vedette.alcool ? <GlasseY /> : <GlasseU />}
                                </span>
                            )}
                            <span className="vedette__legende">
                                {vedette.avis.length > 0 ? "Le mieux noté" : "Dernière recette"}
                            </span>
                            <span className="vedette__nom">{vedette.nomcocktail}</span>
                            <span className="vedette__desc">{vedette.description}</span>
                            <span className="vedette__meta">
                                <span className={`statut statut--${vedette.difficulte}`}>{vedette.difficulte}</span>
                                <span>{vedette.duree} min</span>
                                <span>{vedette.avis.length > 0 ? `${formatNote(getMoyenne(vedette))}/5 (${vedette.avis.length} avis)` : "Aucun avis"}</span>
                                <span className={`tag ${vedette.alcool ? "tag--alcool" : ""}`}>{vedette.alcool ? "Alcool" : "Sans alcool"}</span>
                            </span>
                        </button>
                    )}
                </section>

                <div className="barre">
                    <p className="barre__compte">{n} recette{n > 1 ? "s" : ""}{portee}</p>
                    <div className="barre__outils">
                        <div className="barre__difficulte" role="group" aria-label="Difficulté">
                            {["Facile", "Moyen", "Difficile"].map((d) => (
                                <button key={d} className={`pill pill--${d.toLowerCase()} ${filtreDifficulte === d ? "pill--active" : ""}`} aria-pressed={filtreDifficulte === d}
                                    onClick={() => setFiltreDifficulte(filtreDifficulte === d ? "" : d)}>{d}</button>
                            ))}
                        </div>
                        <select className="select-pill" aria-label="Trier par" value={tri} onChange={(e) => setTri(e.target.value)}>
                            <option value="date_desc">Plus récentes</option>
                            <option value="date_asc">Plus anciennes</option>
                            <option value="note_desc">Mieux notées</option>
                            <option value="note_asc">Moins bien notées</option>
                            <option value="duree_asc">Plus rapides</option>
                            <option value="duree_desc">Plus longues</option>
                            <option value="diff_asc">Plus faciles</option>
                            <option value="diff_desc">Plus difficiles</option>
                        </select>
                        <button className={`pill ${affiner ? "pill--active" : ""}`} aria-expanded={affiner} onClick={() => setAffiner(!affiner)}>
                            Affiner
                        </button>
                    </div>
                </div>

                {affiner && (
                    <div className="affiner">
                        <div className="champ">
                            <label htmlFor="dmin">Durée min (min)</label>
                            <input id="dmin" type="number" min={0} value={filtreDureeMin || ""} onChange={(e) => setFiltreDureeMin(parseInt(e.target.value) || 0)} />
                        </div>

                        <div className="champ">
                            <label htmlFor="dmax">Durée max (min)</label>
                            <input id="dmax" type="number" min={0} value={filtreDureeMax || ""} onChange={(e) => setFiltreDureeMax(parseInt(e.target.value) || 0)} />
                            {filtreDureeMax > 0 && filtreDureeMax < filtreDureeMin && (
                                <p className="champ__erreur">Le max doit dépasser le min</p>
                            )}
                        </div>

                        <div className="champ">
                            <label htmlFor="nmin">Note min</label>
                            <select id="nmin" value={filtreNoteMin} onChange={(e) => setFiltreNoteMin(parseInt(e.target.value))}>
                                <option value={0}>-</option>
                                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <div className="champ">
                            <label htmlFor="nmax">Note max</label>
                            <select id="nmax" value={filtreNoteMax} onChange={(e) => setFiltreNoteMax(parseInt(e.target.value))}>
                                <option value={0}>-</option>
                                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                            {filtreNoteMax > 0 && filtreNoteMax < filtreNoteMin && (
                                <p className="champ__erreur">Le max doit dépasser le min</p>
                            )}
                        </div>

                        <div className="champ">
                            <label htmlFor="ustensiles">Ustensiles</label>
                            <SelecteurMultiple
                                id="ustensiles"
                                placeholder="Ajouter un ustensile"
                                options={listeUstensiles.map((u) => ({ id: u.idustensile, nom: u.nomustensile }))}
                                selection={filtreUstensiles}
                                onChange={setFiltreUstensiles}
                            />
                        </div>

                        <div className="champ">
                            <span aria-hidden="true">&nbsp;</span>
                            <button className="pill" onClick={reinitialiser}>Réinitialiser</button>
                        </div>
                    </div>
                )}

                {filtresActifs.length > 0 && (
                    <div className="actifs" role="group" aria-label="Filtres actifs">
                        {filtresActifs.map((f) => (
                            <span key={f.cle} className="puce">
                                {f.libelle}
                                <button type="button" aria-label={`Retirer le filtre ${f.libelle}`} onClick={f.retirer}>×</button>
                            </span>
                        ))}
                        <button type="button" className="actifs__effacer" onClick={effacerFiltres}>Effacer les filtres</button>
                    </div>
                )}

                {n === 0 ? (
                    <div className="vide">
                        <span className="vide__verre" aria-hidden="true"><GlasseU /></span>
                        <div>
                            <p className="vide__titre">Le shaker est vide…</p>
                            <p>Aucune recette ne correspond à ces ingrédients et filtres. Retirez un ingrédient ou réinitialisez.</p>
                            <button className="pill pill--mangue" onClick={reinitialiser}>Réinitialiser</button>
                        </div>
                    </div>
                ) : (
                    <ul className="recettes">
                        {liste.map((c, i) => (
                            <Fragment key={c.idcocktail}>
                            <li className="recette recette--cliquable" onClick={(e) => {
                                // Toute la carte ouvre la fiche, sauf ses propres boutons (favori…)
                                if ((e.target as HTMLElement).closest("button, a")) return;
                                navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`);
                            }}>
                                <div className="recette__corps">
                                    <h2>
                                        <button className="recette__nom" onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)}>
                                            {c.nomcocktail}
                                        </button>
                                    </h2>
                                    <p className="recette__desc">{c.description}</p>
                                    <div className="recette__meta">
                                        <span className={`statut statut--${c.difficulte}`}>{c.difficulte}</span>
                                        <span>{c.duree} min</span>
                                        <span>{c.avis.length > 0 ? `${formatNote(getMoyenne(c))}/5 (${c.avis.length} avis)` : "Aucun avis"}</span>
                                        <span className={`tag ${c.alcool ? "tag--alcool" : ""}`}>{c.alcool ? "Alcool" : "Sans alcool"}</span>
                                    </div>
                                </div>

                                <div className="recette__actions">
                                    <button className={`pill ${favoris.includes(c.idcocktail) ? "pill--mangue" : ""}`} aria-pressed={favoris.includes(c.idcocktail)}
                                        onClick={() => toggleFavori(c.idcocktail)}>
                                        {favoris.includes(c.idcocktail) ? "Dans mes favoris" : "Ajouter aux favoris"}
                                    </button>
                                </div>

                                {c.image[0] ? (
                                    <img className="recette__visuel" src={`/api${c.image[0].urlimage}`} alt={c.image[0].titleimage || c.nomcocktail} />
                                ) : (
                                    <div className={`recette__visuel recette__visuel--vide ${c.alcool ? "recette__visuel--alcool" : "recette__visuel--moktail"}`} aria-hidden="true">
                                        {c.alcool ? <GlasseY /> : <GlasseU />}
                                    </div>
                                )}
                            </li>
                            {(i + 1) % 2 === 0 && i < 18 && i < liste.length - 1 && pubAutorisee(SLOT_LISTE) && (
                                <li className="pub"><AdSlot slot={SLOT_LISTE} /></li>
                            )}
                            </Fragment>
                        ))}
                    </ul>
                )}
            </main>
        </>
    );
}

export default Home;
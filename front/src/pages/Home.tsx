import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

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

function Home() {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [favoris, setFavoris] = useState<string[]>([]);
    const [tri, setTri] = useState(() => sessionStorage.getItem("tri") || "date_desc");
    const [filtreDifficulte, setFiltreDifficulte] = useState(() => sessionStorage.getItem("filtreDifficulte") || "");
    const [filtreDureeMin, setFiltreDureeMin] = useState(() => parseInt(sessionStorage.getItem("filtreDureeMin") || "0"));
    const [filtreDureeMax, setFiltreDureeMax] = useState(() => parseInt(sessionStorage.getItem("filtreDureeMax") || "0"));
    const [filtreNoteMin, setFiltreNoteMin] = useState(() => parseInt(sessionStorage.getItem("filtreNoteMin") || "0"));
    const [filtreNoteMax, setFiltreNoteMax] = useState(() => parseInt(sessionStorage.getItem("filtreNoteMax") || "0"));
    const [filtreIngredients, setFiltreIngredients] = useState<string[]>(() => JSON.parse(sessionStorage.getItem("filtreIngredients") || "[]"));
    const [filtreUstensiles, setFiltreUstensiles] = useState<string[]>(() => JSON.parse(sessionStorage.getItem("filtreUstensiles") || "[]"));
    const [rechercheIngredient, setRechercheIngredient] = useState("");
    const [listeIngredients, setListeIngredients] = useState<{ idingredient: string; nomingredient: string }[]>([]);
    const [rechercheUstensile, setRechercheUstensile] = useState("");
    const [listeUstensiles, setListeUstensiles] = useState<{ idustensile: string; nomustensile: string }[]>([]);

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
        const token = localStorage.getItem("token");
        if (!token) return;
        axios.get("/api/compte/mes-favoris", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => setFavoris(res.data.map((f: any) => f.idcocktail)));
    }, []);

    useEffect(() => {
        if (searchParams.get("q")) return;

        const token = localStorage.getItem("token");
        const estMineur = localStorage.getItem("estMineur") === "true";
        const alcoolParam = searchParams.get("alcool");

        let url = "/api/cocktail?alcool=false";

        if (alcoolParam === "true") {
            if (token && !estMineur) {
                url = "/api/cocktail?alcool=true";
            } else if (!token) {
                navigate("/login");
                return;
            } else {
                url = "/api/cocktail?alcool=false";
            }
        } else if (alcoolParam === "false") {
            url = "/api/cocktail?alcool=false";
        } else {
            url = token && !estMineur ? "/api/cocktail" : "/api/cocktail?alcool=false";
        }

        if (filtreIngredients.length > 0) {
            url += `&ingredients=${filtreIngredients.join(',')}`;
        }
        if (filtreUstensiles.length > 0) {
            url += `&ustensiles=${filtreUstensiles.join(',')}`;
        }

        axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
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
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        if (favoris.includes(idcocktail)) {
            await axios.delete(`/api/compte/favori/${idcocktail}`, { headers: { Authorization: `Bearer ${token}` } });
            setFavoris(favoris.filter((id) => id !== idcocktail));
        } else {
            await axios.post(`/api/compte/favori/${idcocktail}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setFavoris([...favoris, idcocktail]);
        }
    };

    const getMoyenne = (c: Cocktail) =>
        c.avis.length ? c.avis.reduce((s, av) => s + av.noteavis, 0) / c.avis.length : 0;

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

    return (
        <div>
            <h1>MyCocktail</h1>

            <div style={{ display: 'flex', gap: '10px', margin: '10px 0', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                <select value={tri} onChange={(e) => setTri(e.target.value)}>
                    <option value="date_desc">Plus récents</option>
                    <option value="date_asc">Plus anciens</option>
                    <option value="note_desc">Mieux notés</option>
                    <option value="note_asc">Moins bien notés</option>
                    <option value="duree_asc">Durée croissante</option>
                    <option value="duree_desc">Durée décroissante</option>
                    <option value="diff_asc">Moins difficile</option>
                    <option value="diff_desc">Plus difficile</option>
                </select>

                <select value={filtreDifficulte} onChange={(e) => setFiltreDifficulte(e.target.value)}>
                    <option value="">Toutes difficultés</option>
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                </select>

                <div>
                    <label>Durée min</label>
                    <input type="number" min={0} value={filtreDureeMin || ""} onChange={(e) => setFiltreDureeMin(parseInt(e.target.value) || 0)} style={{ width: '60px' }} />
                </div>

                <div>
                    <label>Durée max</label>
                    <input type="number" min={0} value={filtreDureeMax || ""} onChange={(e) => setFiltreDureeMax(parseInt(e.target.value) || 0)} style={{ width: '60px' }} />
                    {filtreDureeMax > 0 && filtreDureeMax < filtreDureeMin && (
                        <p style={{ color: 'red' }}>Max doit être supérieure à min</p>
                    )}
                </div>

                <div>
                    <label>Note min</label>
                    <select value={filtreNoteMin} onChange={(e) => setFiltreNoteMin(parseInt(e.target.value))}>
                        <option value={0}>-</option>
                        {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div>
                    <label>Note max</label>
                    <select value={filtreNoteMax} onChange={(e) => setFiltreNoteMax(parseInt(e.target.value))}>
                        <option value={0}>-</option>
                        {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {filtreNoteMax > 0 && filtreNoteMax < filtreNoteMin && (
                        <p style={{ color: 'red' }}>Max doit être supérieure à min</p>
                    )}
                </div>

                {/* Filtre ingrédients */}
                <div>
                    <label>Ingrédients</label>
                    <input
                        placeholder="Rechercher..."
                        value={rechercheIngredient}
                        onChange={(e) => setRechercheIngredient(e.target.value)}
                    />
                    {rechercheIngredient && (
                        <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto', position: 'absolute', background: 'white', zIndex: 10 }}>
                            {listeIngredients
                                .filter((i) => i.nomingredient.toLowerCase().includes(rechercheIngredient.toLowerCase()))
                                .map((i) => (
                                <div key={i.idingredient} onClick={() => {
                                    if (!filtreIngredients.includes(i.idingredient)) setFiltreIngredients([...filtreIngredients, i.idingredient]);
                                    setRechercheIngredient("");
                                }} style={{ padding: '8px', cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}>
                                    {i.nomingredient}
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {filtreIngredients.map((id) => {
                            const ing = listeIngredients.find((i) => i.idingredient === id);
                            return (
                                <span key={id} style={{ background: '#eee', padding: '3px 8px', borderRadius: '12px', fontSize: '14px' }}>
                                    {ing?.nomingredient}
                                    <button onClick={() => setFiltreIngredients(filtreIngredients.filter((f) => f !== id))} style={{ marginLeft: '5px', border: 'none', background: 'none', cursor: 'pointer' }}>x</button>
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Filtre ustensiles */}
                <div>
                    <label>Ustensiles</label>
                    <input
                        placeholder="Rechercher..."
                        value={rechercheUstensile}
                        onChange={(e) => setRechercheUstensile(e.target.value)}
                    />
                    {rechercheUstensile && (
                        <div style={{ border: '1px solid #ccc', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto', position: 'absolute', background: 'white', zIndex: 10 }}>
                            {listeUstensiles
                                .filter((u) => u.nomustensile.toLowerCase().includes(rechercheUstensile.toLowerCase()))
                                .map((u) => (
                                <div key={u.idustensile} onClick={() => {
                                    if (!filtreUstensiles.includes(u.idustensile)) setFiltreUstensiles([...filtreUstensiles, u.idustensile]);
                                    setRechercheUstensile("");
                                }} style={{ padding: '8px', cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}>
                                    {u.nomustensile}
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {filtreUstensiles.map((id) => {
                            const ust = listeUstensiles.find((u) => u.idustensile === id);
                            return (
                                <span key={id} style={{ background: '#eee', padding: '3px 8px', borderRadius: '12px', fontSize: '14px' }}>
                                    {ust?.nomustensile}
                                    <button onClick={() => setFiltreUstensiles(filtreUstensiles.filter((f) => f !== id))} style={{ marginLeft: '5px', border: 'none', background: 'none', cursor: 'pointer' }}>x</button>
                                </span>
                            );
                        })}
                    </div>
                </div>

                <button onClick={() => {
                    sessionStorage.removeItem("tri");
                    sessionStorage.removeItem("filtreDifficulte");
                    sessionStorage.removeItem("filtreDureeMin");
                    sessionStorage.removeItem("filtreDureeMax");
                    sessionStorage.removeItem("filtreNoteMin");
                    sessionStorage.removeItem("filtreNoteMax");
                    sessionStorage.removeItem("filtreIngredients");
                    sessionStorage.removeItem("filtreUstensiles");
                }}>
                    Réinitialiser
                </button>
            </div>

            {cocktailsTries.map((c) => (
                <div key={c.idcocktail}>
                    {c.image[0] && (
                        <img src={`/api${c.image[0].urlimage}`} alt={c.nomcocktail} width={200} />
                    )}
                    <h2 onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)} style={{ cursor: 'pointer' }}>
                        {c.nomcocktail}
                    </h2>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavori(c.idcocktail); }}>
                        {favoris.includes(c.idcocktail) ? "Favori" : "Ajouter"}
                    </button>
                    <p>{c.description}</p>
                    <p>Difficulté : {c.difficulte}</p>
                    <p>Durée : {c.duree} min</p>
                    <p>{c.avis.length > 0 ? `${getMoyenne(c).toFixed(1)}/5 (${c.avis.length} avis)` : "Aucun avis"}</p>
                    <p>{c.alcool ? "Avec alcool" : "Sans alcool"}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Home;
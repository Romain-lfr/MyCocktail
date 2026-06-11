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
    image: { urlimage: string; titleimage: string }[];
    avis: { noteavis: number }[];
}

function Home() {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [favoris, setFavoris] = useState<string[]>([]);
    const [tri, setTri] = useState("date_desc");
    const [filtreDifficulte, setFiltreDifficulte] = useState("");
    const [filtreDureeMin, setFiltreDureeMin] = useState(0);
    const [filtreDureeMax, setFiltreDureeMax] = useState(0);
    const [filtreNoteMin, setFiltreNoteMin] = useState(0);
    const [filtreNoteMax, setFiltreNoteMax] = useState(0);

    const getMoyenne = (c: Cocktail) =>
    c.avis.length ? c.avis.reduce((s, av) => s + av.noteavis, 0) / c.avis.length : 0;

    const cocktailsTries = [...cocktails]
    .filter((c) => !filtreDifficulte || c.difficulte === filtreDifficulte)
    .filter((c) => !filtreDureeMin || c.duree >= filtreDureeMin)
    .filter((c) => !filtreDureeMax || filtreDureeMax >= filtreDureeMin && c.duree <= filtreDureeMax)
    .filter((c) => !filtreNoteMin || getMoyenne(c) >= filtreNoteMin)
    .filter((c) => !filtreNoteMax || filtreNoteMax >= filtreNoteMin && getMoyenne(c) <= filtreNoteMax)
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        axios.get("/api/compte/mes-favoris", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            setFavoris(res.data.map((f: any) => f.idcocktail));
        });
    }, []);

    const toggleFavori = async (idcocktail: string) => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        if (favoris.includes(idcocktail)) {
            await axios.delete(`/api/compte/favori/${idcocktail}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavoris(favoris.filter((id) => id !== idcocktail));
        } else {
            await axios.post(`/api/compte/favori/${idcocktail}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavoris([...favoris, idcocktail]);
        }
    };

    useEffect(() => {
        // Ignore si c'est une recherche globale
        if (searchParams.get("q")) return;

        const token = localStorage.getItem("token");
        const estMineur = localStorage.getItem("estMineur") === "true";
        const alcoolParam = searchParams.get("alcool");

        let url = "/api/cocktail?alcool=false";

        if (alcoolParam === "true") {
            if (token && !estMineur) {
                url = "/api/cocktail?alcool=true";
            } else {
                navigate("/login");
                return;
            }
        } else if (alcoolParam === "false") {
            url = "/api/cocktail?alcool=false";
        } else {
            url = token && !estMineur
                ? "/api/cocktail"
                : "/api/cocktail?alcool=false";
        }

        axios.get(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .then((res) => setCocktails(res.data))
        .catch((err) => {
            console.error(err);
            if (token) {
                localStorage.removeItem("token");
                localStorage.removeItem("estMineur");
                navigate("/login");
            }
        });
    }, [searchParams, location]);

    return (
        <div>
            <h1>MyCocktail</h1>
            <div style={{ display: 'flex', gap: '10px', margin: '10px 0', flexWrap: 'wrap' }}>
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
                    <label>Durée min (min)</label>
                    <input type="number" min={0} value={filtreDureeMin || ""} onChange={(e) => setFiltreDureeMin(parseInt(e.target.value) || 0)} style={{ width: '60px' }} />
                </div>

                <div>
                    <label>Durée max (min)</label>
                    <input type="number" min={0} value={filtreDureeMax || ""} onChange={(e) => setFiltreDureeMax(parseInt(e.target.value) || 0)} style={{ width: '60px' }} />
                </div>
                {filtreDureeMax > 0 && filtreDureeMax < filtreDureeMin && (
                    <p style={{ color: 'red' }}>La durée max doit être supérieure à la durée min</p>
                )}

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
                </div>
                {filtreNoteMax > 0 && filtreNoteMax < filtreNoteMin && (
                    <p style={{ color: 'red' }}>La note max doit être supérieure à la note min</p>
                )}

                <button onClick={() => { setTri("date_desc"); setFiltreDifficulte(""); setFiltreDureeMin(0); setFiltreDureeMax(0); setFiltreNoteMin(0); setFiltreNoteMax(0); }}>
                    Réinitialiser
                </button>
                </div>
            {cocktailsTries.map((c) => (
                <div key={c.idcocktail}>
                    {c.image[0] && (
                        <img
                            src={`/api${c.image[0].urlimage}`}
                            alt={c.nomcocktail}
                            width={200}
                        />
                    )}
                    <h2
                        onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)}
                        style={{ cursor: 'pointer' }}
                    >{c.nomcocktail}</h2>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavori(c.idcocktail); }}>
                        {favoris.includes(c.idcocktail) ? "Favori" : "Ajouter"}
                    </button>
                    <p>{c.description}</p>
                    <p>Difficulté : {c.difficulte}</p>
                    <p>Durée : {c.duree} min</p>
                    <p>
                        {c.avis.length > 0
                        ? `${(c.avis.reduce((sum, a) => sum + a.noteavis, 0) / c.avis.length).toFixed(1)}/5 (${c.avis.length} avis)`
                        : "Aucun avis"}
                    </p>
                    <p>{c.alcool ? "Avec alcool" : "Sans alcool"}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Home;
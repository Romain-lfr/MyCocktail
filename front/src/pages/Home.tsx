import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

interface Image {
    image: {
        urlimage: string;
        titleimage: string;
    };
}

interface Cocktail {
    idcocktail: string;
    nomcocktail: string;
    description: string;
    difficulte: string;
    alcool: boolean;
    duree: number;
    image: { urlimage: string; titleimage: string }[];
}

function Home() {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [favoris, setFavoris] = useState<string[]>([]);

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
        const token = localStorage.getItem("token");
        const estMineur = localStorage.getItem("estMineur") === "true";
        const alcoolParam = searchParams.get("alcool");

        console.log("search:", location.search);
        console.log("alcool:", searchParams.get("alcool"));
        
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

        console.log("URL finale:", url);

        axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .then((res) => {
            console.log("cocktails reçus:", res.data.length);
            setCocktails(res.data);
        })
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
            <h1>🍹 MyCocktail</h1>
            <p>Nombre Total : {cocktails.length}</p>
            {cocktails.map((c) => (
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
                        {favoris.includes(c.idcocktail) ? "❤️" : "🤍"}
                    </button>
                    <p>{c.description}</p>
                    <p>Difficulté : {c.difficulte}</p>
                    <p>Durée : {c.duree} min</p>
                    <p>{c.alcool ? "Avec alcool" : "Sans alcool"}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Home;
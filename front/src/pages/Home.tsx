import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    image_cocktail: Image[];
}



function Home() {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("estMineur");
        navigate("/login");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const estMineur = localStorage.getItem("estMineur") === "true";

        const url = token && !estMineur
            ? "/api/cocktail"
            : "/api/cocktail?alcool=false";

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
    }, []);

    return (
        <div>
            <button onClick={handleLogout}>Se déconnecter</button>
            <h1>🍹 MyCocktail</h1>
            {cocktails.map((c) => (
                <div key={c.idcocktail}>
                    {c.image_cocktail[0] && (
                        <img
                        src={`/api${c.image_cocktail[0].image.urlimage}`}
                        alt={c.nomcocktail}
                        width={200}
                        />
                    )}
                    <h2 
                        onClick={() => navigate(`/cocktail/${encodeURIComponent(c.nomcocktail)}`)}
                        style={{ cursor: 'pointer' }}
                    > {c.nomcocktail} </h2>
                    <p>{c.description}</p>
                    <p>Difficulté : {c.difficulte}</p>
                    <p>Durée : {c.duree} min</p>
                    <p>{c.alcool ? "🍸 Avec alcool" : "🥤 Sans alcool"}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Home;
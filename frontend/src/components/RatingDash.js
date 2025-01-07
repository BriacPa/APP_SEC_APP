import axiosInstance from "../utils/axiosInstance";
import { useState, useEffect } from "react";

const RatingDash = ({ user, setUser }) => {
    const [Rating, setRating] = useState([]);

    const fetchRatings = async () => {
        await axiosInstance.get('/rating/', { withCredentials: true })
            .then((res) => {
                setRating(res.data);
            })
            .catch((err) => {
            });
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    const deleteRating = (RatingId) => async () => {
        await axiosInstance.delete(`/rating/del/${RatingId}`, { withCredentials: true });
        fetchRatings();
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Ratings</h1>
            {Rating.map((rate) => (
                <div key={rate._id} className="card mb-3">
                    <div className="card-body">
                        <p className="card-text">
                            Article: <a href={`/articles/open/?title=${rate.article.title}`}>{rate.article.title}</a>
                            - Value: {rate.rate}/5 at {new Date(rate.createdAt).toLocaleString()}
                        </p>
                        <button onClick={deleteRating(rate._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RatingDash;

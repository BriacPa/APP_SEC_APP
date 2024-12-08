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
                    console.error(err);
                });
    }

    useEffect(() => {
        fetchRatings();
    }
    , []); 


    const deleteRating = (RatingId) => async () => {
        await axiosInstance.delete(`/rating/del/${RatingId}`, { withCredentials: true });
        fetchRatings();
    };
    
    return (
        <div>
        <h1>Ratings</h1>
        {Rating.map((rate) => (
            <div key={rate._id}>
                <p>Article : <a href={`/article/?title=${rate.article.title}`}>{rate.article.title}</a> - Value : {rate.rate}/5 at {new Date(rate.createdAt).toLocaleString()}</p>
                <button onClick={deleteRating(rate._id)}>Delete</button>
            </div>
        ))}
        </div>
    );
    
}

export default RatingDash;
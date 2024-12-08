import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [rating, setRating] = useState(0);
    useEffect(() => {
        const fetchArticles = async () => {
            const response = await axiosInstance.get('/article/allArticles');
            setArticles(response.data);
        };
        fetchArticles();
    }, []);


    return (
        <div>
            <h2>Articles</h2>
            {articles.map((article) => (
                <div key={article._id}>
                    <h3>
                        <a href={`/article/?title=${article.title}`}>{article.title}</a>
                    </h3>
                    <p>Categories: {article.categories.join(', ')}</p>
                    <p>Created at: {new Date(article.createdAt).toLocaleString()}</p>
                    {article.rating === 0 ? <p>Rating : No rating yet</p> : <p>Rating: {article.rating}/5</p>}
                    <p>{article.body}</p>
                    <p>Author: {article.author.username}</p>
                </div>
            ))}
        </div>
    );
}

export default Articles;
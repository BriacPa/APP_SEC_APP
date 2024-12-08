import axiosInstance from "../utils/axiosInstance";
import { useState, useEffect } from "react";

const ArticleDash = ({ user, setUser }) => {
    const [Articles, setArticles] = useState([]);

    const fetchArticles = async () => {
            axiosInstance.get('article/articlesAuthor', { withCredentials: true })
                .then((res) => {
                    setArticles(res.data);
                })
                .catch((err) => {
                    console.error(err);
                });
    }

    useEffect(() => {
        fetchArticles();
    }
    , []); 

    

    const deleteArticle = (ArticleId) => async () => {
        await axiosInstance.delete(`/Article/del/${ArticleId}`, { withCredentials: true });
        fetchArticles();
    };
    
    return (
        <div>
        <h1>Articles</h1>
        {Articles.map((article) => (
            <div key={article._id}>
                <p>Article : <a href={`/article/?title=${article.title}`}>{article.title}</a> at {new Date(article.createdAt).toLocaleString()}</p>
                <button onClick={deleteArticle(article._id)}>Delete</button>
            </div>
        ))}
        </div>
    );
    
}

export default ArticleDash;
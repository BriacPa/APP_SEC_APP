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
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const deleteArticle = (ArticleId) => async () => {
        await axiosInstance.delete(`/Article/del/${ArticleId}`, { withCredentials: true });
        fetchArticles();
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Articles</h1>
            {Articles.map((article) => (
                <div key={article._id} className="card mb-3">
                    <div className="card-body">
                        <p className="card-text">
                            Article: <a href={`/article/?title=${article.title}`}>{article.title}</a> 
                            at {new Date(article.createdAt).toLocaleString()}
                        </p>
                        <button onClick={deleteArticle(article._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ArticleDash;

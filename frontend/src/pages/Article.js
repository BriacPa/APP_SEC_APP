import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const Articles = () => {
    const [article, setArticle] = useState({});
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [rate, setRate] = useState('');

    // Set the title from the URL query parameter only on initial render
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const titleFromUrl = queryParams.get('title'); // assuming the title is passed in the URL as `?title=someTitle`
        if (titleFromUrl && title !== titleFromUrl) {
            setTitle(titleFromUrl);  // Update the state only once with the value from the URL
        }
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Check user authentication
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                await axiosInstance.get('/auth/isAuthenticated', {
                    withCredentials: true,
                });
                setIsAuthenticated(true);
                console.log('Authenticated');
            } catch (err) {
                setIsAuthenticated(false);
                console.log('Not Authenticated');
            }
        };
        checkAuthentication();
    }, []);

    // Fetch article data based on title
    useEffect(() => {
        if (!title) return; // Don't fetch article if title is empty
        const fetchArticle = async () => {
            try {
                const response = await axiosInstance.get(`/article/article?title=${title}`);
                setArticle(response.data);
            } catch (err) {
                setError('Failed to fetch article');
            }
        };

        fetchArticle();
    }, [title]); // This effect runs whenever the title changes

    // Function to fetch comments
    const fetchComments = async () => {
        if (!article._id) return; // Don't fetch comments if article ID is not available
        try {
            const response = await axiosInstance.get(`/article/comments?articleId=${article._id}`);
            setComments(response.data);
        } catch (err) {
            setError('Failed to fetch comments : ' + err.message);
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!article._id) {
            setError('Article not found');
            return;
        }
        console.log(isAuthenticated);

        try {
            if (!isAuthenticated) {
                await axiosInstance.post('/article/commentNO', {
                    articleId: article._id,
                    comment,
                });
            } else {
                await axiosInstance.post(
                    '/article/comment',
                    {
                        articleId: article._id,
                        comment,
                    },
                    {
                        withCredentials: true,
                    }
                );
            }
            setComment(''); // Clear the comment input after successful submission
            // Fetch comments after submitting
            fetchComments();
        } catch (err) {
            setError('Failed to submit comment');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [article._id]); // Fetch comments whenever the article ID changes

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (!article._id) {
            setError('Article not found');
            return;
        }

        try {
            await axiosInstance.post(
                '/article/rate',
                {
                    articleId: article._id,
                    rate,
                },
                {
                    withCredentials: true,
                }
            );
            setRate(''); // Clear the rating input after successful submission
            // Fetch article after submitting rating
            const response = await axiosInstance.get(`/article/article?title=${title}`);
            setArticle(response.data);
        } catch (err) {
            setError('Failed to submit rating : '+ err.message);
        }
    }


    let strRate = article.rating + "/5";
    if(article.rating === 0){
        strRate = "No rating yet";
    }

    return (
        <div>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <h1>{article.title}</h1>
                    <p>Created at: {new Date(article.createdAt).toLocaleString()}</p>
                    <p>Categories: {article.categories?.join(', ')}</p>
                    <p>Rating: {strRate}</p>    
                    <p>{article.body}</p>
                    <p>Author: {article.author?.username}</p>

                    {isAuthenticated && (
                        <>
                            <div>
                                <h4>Rate this Article</h4>
                                <form onSubmit={handleRatingSubmit}>
                                    <select value={rate} onChange={(e) => setRate(e.target.value)} required>
                                        <option value="">Select a rating</option>
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit">Submit Rating</button>
                                </form>
                            </div>
                        </>
                    )}
                    <div>
                                <h4>Comments</h4>
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment._id}>
                                            <p>
                                                {comment.author?.username || 'Anonymous'}: {comment.body} at {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No comments yet.</p>
                                )}
                            </div>
                    <div>
                        <h4>Leave a Comment</h4>
                        <form onSubmit={handleCommentSubmit}>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your comment here"
                                required
                            />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default Articles;

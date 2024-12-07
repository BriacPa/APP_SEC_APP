import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const Articles = () => {
    const [article, setArticle] = useState({});
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);

    // Set the title from the URL query parameter only on initial render
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const titleFromUrl = queryParams.get('title'); // assuming the title is passed in the URL as `?title=someTitle`
        if (titleFromUrl && title !== titleFromUrl) {
            setTitle(titleFromUrl);  // Update the state only once with the value from the URL
        }
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Fetch article data based on title
    useEffect(() => {
        if (!title) return;  // Don't fetch article if title is empty
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
        if (!article._id) return;  // Don't fetch comments if article ID is not available
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

        try {
            await axiosInstance.post('/article/comment', {
                articleId: article._id,
                comment,
            }, {
                withCredentials: true
            });
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

    return (
        <div>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <h1>{article.title}</h1>
                    <p>{article.body}</p>
                    <p>Author: {article.author?.username}</p>

                    {/* Display comments */}
                    <div>
                        <h4>Comments</h4>
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment._id}>
                                    <p>{comment.author?.username}: {comment.body}</p>
                                </div>
                            ))
                        ) : (
                            <p>No comments yet.</p>
                        )}
                    </div>

                    {/* Comment Section */}
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

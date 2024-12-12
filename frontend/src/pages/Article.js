import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Row, Col, Button, Form, Card, Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';

const Articles = () => {
    const [article, setArticle] = useState({});
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [rate, setRate] = useState('');
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true); // State to track loading
    const [loading2, setLoading2] = useState(true); // State to track loading


    // Set the title from the URL query parameter only on initial render
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const titleFromUrl = queryParams.get('title'); // assuming the title is passed in the URL as `?title=someTitle`
        if (titleFromUrl && title !== titleFromUrl) {
            setTitle(titleFromUrl);  // Update the state only once with the value from the URL
        }
    }, []); // Empty dependency array ensures this effect runs only once on mount

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user', { withCredentials: true });
                setUser(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false); // Mark loading as complete
            }
        };

        fetchUser();
    }, []);

    // Check user authentication
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                await axiosInstance.get('/auth/isAuthenticated', { withCredentials: true });
                setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setLoading2(false); // Mark loading as complete
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

    const canEdit = () => {
        return user.role === 'admin' || user._id === article.author?._id || user.role === 'moderator';
    };

    const canEditCom = (comment) => {
        return user.role === 'admin' || user._id === comment.author?._id || user.role === 'moderator';
    };

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
            setError('Failed to submit rating : ' + err.message);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await axiosInstance.delete(`/comment/del?id=${commentId}`, { withCredentials: true });
            fetchComments();
        } catch (err) {
            setError('Failed to delete comment');
        }
    };

    const DeleteArticle = async () => {
        try {
            await axiosInstance.delete(`/article/del/${article._id}`, { withCredentials: true });
            window.location.href = '/articles';
        } catch (err) {
            setError('Failed to delete article');
        }
    };

    let strRate = article.rating + "/5";
    if (article.rating === 0) {
        strRate = "No rating yet";
    }

    if (loading || loading2) return <p>Loading...</p>;

    return (
        <div>
            <NavBar user/>
            <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Row className="w-100">
                    <Col md={8} className="mx-auto">
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Card>
                            <Card.Body>
                                <Card.Title>{article.title}</Card.Title>
                                <Card.Text>
                                    <strong>Created at:</strong> {new Date(article.createdAt).toLocaleString()}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Categories: </strong>{article.categories ? article.categories.map((category) => category.name).join(', ') : 'No categories'}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Rating:</strong> {strRate}
                                </Card.Text>
                                <Card.Text>{article.body}</Card.Text>
                                <Card.Text>
                                    <strong>Author:</strong> {article.author?.username}
                                </Card.Text>
                                {canEdit() && (
                                    <Button variant="danger" onClick={DeleteArticle}>
                                        Delete Article
                                    </Button>
                                )}
                            </Card.Body>
                        </Card>

                        {isAuthenticated && (
                            <Card className="mt-3">
                                <Card.Body>
                                    <h5>Rate this Article</h5>
                                    <Form onSubmit={handleRatingSubmit}>
                                        <Form.Group controlId="rating">
                                            <Form.Control
                                                as="select"
                                                value={rate}
                                                onChange={(e) => setRate(e.target.value)}
                                                required
                                            >
                                                <option value="">Select a rating</option>
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                        <Button variant="primary" type="submit">
                                            Submit Rating
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}

                        <Card className="mt-3">
                            <Card.Body>
                                <h5>Comments</h5>
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment._id}>
                                            <p>
                                                <strong>{comment.author?.username || 'Anonymous'}</strong>: {comment.body}{' '}
                                                <small>at {new Date(comment.createdAt).toLocaleString()}</small>
                                            </p>
                                            {canEditCom(comment) && (
                                                <Button variant="danger" size="sm" onClick={() => deleteComment(comment._id)}>
                                                    Delete Comment
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>No comments yet.</p>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="mt-3">
                            <Card.Body>
                                <h5>Leave a Comment</h5>
                                <Form onSubmit={handleCommentSubmit}>
                                    <Form.Group controlId="comment">
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Write your comment here"
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Submit Comment
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Articles;

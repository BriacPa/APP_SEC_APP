import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Row, Col, Button, Form, Card, Alert } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import NavBar from '../components/NavBar';

const Articles = () => {
    const [article, setArticle] = useState({});
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [rate, setRate] = useState(0);
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [loading3, setLoading3] = useState(true);
    const [loading4, setLoading4] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const titleFromUrl = queryParams.get('title');
        if (titleFromUrl && title !== titleFromUrl) {
            setTitle(titleFromUrl);
        }
    }, [title]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user', { withCredentials: true });
                setUser(response.data);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                await axiosInstance.get('/auth/isAuthenticated', { withCredentials: true });
                setIsAuthenticated(true);
                setLoading2(false);
            } catch (err) {
                setLoading2(false);
            }
        };
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (!title) return;
        const fetchArticle = async () => {
            try {
                const response = await axiosInstance.get(`/article/article?title=${title}`);
                setArticle(response.data);
            } catch (err) {}
            finally {
                setLoading3(false);
            }
        };
        fetchArticle();
    }, [title]);

    const fetchComments = useCallback(async () => {
        if (!article._id) return;
        try {
            const response = await axiosInstance.get(`/article/comments?articleId=${article._id}`);
            setComments(response.data);
        } catch (err) {}
        finally {
            setLoading4(false);
        }
    }, [article._id]);

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
            setComment('');
            fetchComments();
        } catch (err) {
            setError('Failed to submit comment');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [article._id, fetchComments]);

    const canEdit = () => {
        return (user.role === 'admin' || user._id === article.author?._id || user.role === 'moderator') && isAuthenticated;
    };

    const canEditCom = (comment) => {
        return (user.role === 'admin' || user._id === comment.author?._id || user.role === 'moderator') && isAuthenticated;
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
            setRate(0);
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

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FaStar key={i} color="gold" />);
            } else if (i - rating < 1) {
                stars.push(<FaStarHalfAlt key={i} color="gold" />);
            } else {
                stars.push(<FaRegStar key={i} color="gold" />);
            }
        }
        return stars;
    };

    if (loading || loading2 || loading3 || loading4) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
            </div>
        )
    } else {
        return (
            <div>
                <NavBar user={user} />
                <div className="bod2">
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
                                            <strong>Rating:</strong> {renderStars(article.rating)}
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
                                            <div>
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <span
                                                        key={i}
                                                        onClick={() => setRate(i)}
                                                        style={{ cursor: 'pointer', fontSize: '24px' }}
                                                    >
                                                        {i <= rate ? <FaStar color="gold" /> : <FaRegStar color="gold" />}
                                                    </span>
                                                ))}
                                            </div>
                                            <Button variant="primary" onClick={handleRatingSubmit} className="mt-2">
                                                Submit Rating
                                            </Button>
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
            </div>
        );
    }
};

export default Articles;

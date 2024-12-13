import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Button, Table, Form, Container, Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';

const ManageUser = () => {
    const [user, setUser] = useState();
    const [manager, setManager] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [articles, setArticles] = useState([]);
    const [comments, setComments] = useState([]);
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        const par = new URLSearchParams(window.location.search).get('UserID');
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/user/specific-user/?userId=${par}`, {
                    withCredentials: true,
                });
                setUser(response.data);
            } catch (err) {
                setError(err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchManager = async () => {
            try {
                const response = await axiosInstance.get('/user', {
                    withCredentials: true,
                });
                setManager(response.data);
            } catch (err) {
                setError(err);
                console.log(err);
            }
        };
        fetchManager();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            if (user) {
                try {
                    const response = await axiosInstance.get(`/article/ArticlesAuthorQw?id=${user._id}`, {
                        withCredentials: true,
                    });
                    setArticles(response.data);
                } catch (error) {
                    console.error('Failed to fetch articles:', error);
                }
            }
        };

        fetchArticles();
    }, [user]);

    useEffect(() => {
        const fetchComments = async () => {
            if (user) {
                try {
                    const response = await axiosInstance.get(`/comment/CommentsAuthorQw?id=${user._id}`, {
                        withCredentials: true,
                    });
                    setComments(response.data);
                } catch (error) {
                    console.error('Failed to fetch comments:', error);
                }
            }
        };

        fetchComments();
    }, [user]);

    useEffect(() => {
        const fetchRatings = async () => {
            if (user) {
                try {
                    const response = await axiosInstance.get(`/rating/RatingsAuthorQw?id=${user._id}`, {
                        withCredentials: true,
                    });
                    setRatings(response.data);
                } catch (error) {
                    console.error('Failed to fetch ratings:', error);
                }
            }
        };
        fetchRatings();
    }, [user]);

    const changeRole = async (role) => {
        try {
            await axiosInstance.post('/user/change-role/', { userId: user._id, role: role }, { withCredentials: true });
            setUser({ ...user, role });
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    useEffect(() => {
        if (user && manager) {
            if (!(manager.role === 'admin' || (manager.role === 'moderator' && (user.role === 'user' || user.role === 'author')))) {
                setError(new Error('Unauthorized'));
            }
        }
    }, [user, manager]);

    useEffect(() => {
        if (user && manager) {
            setLoading(false);
        }
    }, [user, manager]);

    const handleDeleteArt = async (articleId) => {
        try {
            await axiosInstance.delete(`/article/del/${articleId}`, { withCredentials: true });
            setArticles(articles.filter((article) => article._id !== articleId));
        } catch (error) {
            console.error('Failed to delete article:', error);
        }
    };

    const handleDeleteCom = async (commentId) => {
        try {
            await axiosInstance.delete(`/comment/del/?id=${commentId}`, { withCredentials: true });
            setComments(comments.filter((comment) => comment._id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const handleDeleteRating = async (ratingId) => {
        try {
            await axiosInstance.delete(`/rating/del/${ratingId}`, { withCredentials: true });
            setRatings(ratings.filter((rating) => rating._id !== ratingId));
        } catch (error) {
            console.error('Failed to delete rating:', error);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await axiosInstance.delete(`/user/del/${user._id}`, { withCredentials: true });
            window.location.href = '/user-managment';
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    // Function to convert numeric rating to star representation
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating ? '★' : '☆');
        }
        return stars.join(''); // Join stars as a string
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <Alert variant="danger">Error: {error.message}</Alert>;
    }

    return (
        <>
            <NavBar user={manager} />
            <div class="bod">
            <Container>
                <h1 className="mt-4">{user.username}</h1>
                <Button variant="danger" onClick={() => handleDeleteUser()} className="mb-3">
                    Delete User
                </Button>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <Form.Label htmlFor="role">Change Role:</Form.Label>
                <Form.Select
                    id="role"
                    value={user.role}
                    onChange={(e) => changeRole(e.target.value)}
                    className="mb-3"
                >
                    <option value="user">User</option>
                    <option value="author">Author</option>
                    {manager.role === 'admin' && <option value="moderator">Moderator</option>}
                </Form.Select>
                <p>Created at: {user.createdAt}</p>
                <p>Updated at: {user.updatedAt}</p>

                <h2>{user.username}'s Articles:</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Created at</th>
                            <th>Updated at</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article._id}>
                                <td><a href={`/article/?title=${article.title}`}>{article.title}</a></td>
                                <td>{article.createdAt}</td>
                                <td>{article.updatedAt}</td>
                                <td><Button variant="danger" onClick={() => handleDeleteArt(article._id)}>Delete</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <h2>{user.username}'s Comments:</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Content</th>
                            <th>Created at</th>
                            <th>Updated at</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map((comment) => (
                            <tr key={comment._id}>
                                <td><a href={`/article/?title=${comment.article.title}`}>{comment.article.title}</a></td>
                                <td>{comment.body}</td>
                                <td>{comment.createdAt}</td>
                                <td>{comment.updatedAt}</td>
                                <td><Button variant="danger" onClick={() => handleDeleteCom(comment._id)}>Delete</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <h2>{user.username}'s Ratings:</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Rating</th>
                            <th>Created at</th>
                            <th>Updated at</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratings.map((rating) => (
                            <tr key={rating._id}>
                                <td><a href={`/article/?title=${rating.article.title}`}>{rating.article.title}</a></td>
                                <td>{renderStars(rating.rate)}</td> {/* Render stars here */}
                                <td>{rating.createdAt}</td>
                                <td>{rating.updatedAt}</td>
                                <td><Button variant="danger" onClick={() => handleDeleteRating(rating._id)}>Delete</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
            </div>
        </>
    );
};

export default ManageUser;

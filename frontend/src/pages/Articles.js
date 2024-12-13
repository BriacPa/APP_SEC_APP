import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import NavBar from '../components/NavBar';
import { Nav, Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FaStar, FaRegStar } from 'react-icons/fa';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [rating, setRating] = useState(0);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [selectedCategories, setSelectCategories] = useState([]);
    const [isDescending, setIsDescending] = useState(false);
    const [user, setUser] = useState({});
    const [page, setPage] = useState(1);

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get('/user/', { withCredentials: true });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await axiosInstance.get('/article/allArticles');
            setArticles(response.data);
            setFilteredArticles(response.data);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/categorie');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchArticles();
        fetchCategories();
    }, []);

    useEffect(() => {
        const filteredBySearch = articles.filter((article) => {
            return (
                article.title.toLowerCase().includes(search.toLowerCase()) ||
                article.body.toLowerCase().includes(search.toLowerCase()) ||
                article.author.username.toLowerCase().includes(search.toLowerCase())
            );
        });

        const filteredByRating = rating === 0
            ? filteredBySearch
            : filteredBySearch.filter((article) => article.rating === rating);

        const filteredByCategories = filteredByRating.filter((article) => {
            if (selectedCategories.length === 0) return true;
            return article.categories.some((category) => selectedCategories.includes(category.name));
        });

        setFilteredArticles(filteredByCategories);
    }, [search, rating, articles, selectedCategories]);

    const sortArticles = (sortBy) => {
        const sortedArticles = [...filteredArticles].sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'rating') {
                return b.rating - a.rating;
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });
        if (isDescending) {
            sortedArticles.reverse();
        }
        setFilteredArticles(sortedArticles);
    };

    const toggleSortOrder = () => {
        setIsDescending((prev) => !prev);
        setFilteredArticles((prevArticles) => [...prevArticles].reverse());
    };

    // Function to display stars for a given rating (out of 5)
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <>
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={`full-${i}`} color="gold" />
                ))}
                {halfStar && <FaStar key="half" color="gold" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <FaRegStar key={`empty-${i}`} color="gold" />
                ))}
            </>
        );
    };

    return (
        <div>
            <NavBar user={user} />
            <div class="bod2">
            <Container className="mt-5">
                {/* Search and Filters */}
                <Row className="mb-4">
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Col>

                    <Col md={2}>
                        <Form.Select onChange={(e) => sortArticles(e.target.value)} className="mb-2">
                            <option value="">Sort by</option>
                            <option value="date">Date</option>
                            <option value="rating">Rating</option>
                            <option value="title">Title</option>
                        </Form.Select>
                    </Col>

                    <Col md={2}>
                        <Form.Check
                            type="checkbox"
                            label="Inverse Sort Order"
                            checked={isDescending}
                            onChange={toggleSortOrder}
                        />
                    </Col>
                </Row>

                {/* Categories Filter */}
                <Row className="mb-4">
                    <Col>
                        <h5>Filter by Categories</h5>
                        <div className="d-flex flex-wrap">
                            {categories.map((category) => (
                                <Form.Check
                                    key={category._id}
                                    type="checkbox"
                                    label={`${category.name}`}
                                    value={category.name}
                                    checked={selectedCategories.includes(category.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectCategories([...selectedCategories, category.name]);
                                        } else {
                                            setSelectCategories(
                                                selectedCategories.filter((name) => name !== category.name)
                                            );
                                        }
                                    }}
                                    className="mr-3 mb-2"
                                    custom
                                />
                            ))}
                        </div>
                    </Col>
                </Row>

                {/* Articles Listing */}
                <Row>
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <Col sm={12} md={6} lg={4} key={article._id} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>
                                            <a href={`/articles/open/?title=${article.title}`}>{article.title}</a>
                                        </Card.Title>
                                        <Card.Text>
                                            <strong>Categories:</strong>{' '}
                                            {article.categories.map((category) => category.name).join(', ')}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Created at:</strong>{' '}
                                            {new Date(article.createdAt).toLocaleString()}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Rating:</strong> {renderStars(article.rating)}
                                        </Card.Text>
                                        <Card.Text>{article.body.substring(0, 150)}...</Card.Text>
                                        <Card.Text>
                                            <strong>Author:</strong> {article.author.username}
                                        </Card.Text>
                                        <Button variant="primary" href={`/article/?title=${article.title}`}>
                                            Read more
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <p>No articles found.</p>
                    )}
                </Row>
            </Container>
        </div>
        </div>
    );
};

export default Articles;

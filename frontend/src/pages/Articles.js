import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [rating, setRating] = useState(0);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [selectedCategories, setSelectCategories] = useState([]);
    const [isDescending, setIsDescending] = useState(false);

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

    return (
        <div>
            <h2>Articles</h2>
            <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <select onChange={(e) => sortArticles(e.target.value)}>
                <option value="">Sort by</option>
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="title">Title</option>
            </select>
            <label>
                <input
                    type="checkbox"
                    checked={isDescending}
                    onChange={toggleSortOrder}
                />
                Inverse Sort Order
            </label>
            <div>
                {categories.map((category) => (
                    <label key={category._id}>
                        <input
                            type="checkbox"
                            value={category.name}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectCategories([...selectedCategories, category.name]);
                                } else {
                                    setSelectCategories(selectedCategories.filter((name) => name !== category.name));
                                }
                            }}
                        />
                        {category.name}
                    </label>
                ))}
            </div>

            {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                    <div key={article._id}>
                        <h3>
                            <a href={`/article/?title=${article.title}`}>{article.title}</a>
                        </h3>
                        <p>Categories: {article.categories.map((category) => category.name).join(', ')}</p>
                        <p>Created at: {new Date(article.createdAt).toLocaleString()}</p>
                        {article.rating === 0 ? (
                            <p>Rating: No rating yet</p>
                        ) : (
                            <p>Rating: {article.rating}/5</p>
                        )}
                        <p>{article.body}</p>
                        <p>Author: {article.author.username}</p>
                    </div>
                ))
            ) : (
                <p>No articles found.</p>
            )}
        </div>
    );
};

export default Articles;

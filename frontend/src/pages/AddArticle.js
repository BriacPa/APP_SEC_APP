import React from 'react';
import LogoutButton from '../components/LogoutButton';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';
import axiosInstance from '../utils/axiosInstance';
import NavBar from '../components/NavBar';

function Reset() {
    const { user, error, loading, setUser } = useFetchUserData(); // Use the custom hook
    const [title, setTitle] = React.useState('');
    const [body, setBody] = React.useState('');
    const [categories, setCategories] = React.useState([]);
    const [keywordsArray, setKeywordsArray] = React.useState([]);

    const getCategorie = async () => {
        try {
            const response = await axiosInstance.get('/categorie/');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    React.useEffect(() => {
        getCategorie();
    }, []);

    if (error || loading || !user) {
        return <UserStatus error={error} loading={loading} user={user} />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            alert('Please enter a title');
            return;
        } else if (!body) {
            alert('Please enter a body');
            return;
        } else {
            try {
                const response = await axiosInstance.post(
                    '/article/addArticle',
                    { title, body, categories: keywordsArray },
                    { withCredentials: true }
                );
                console.log('Article added successfully:', response.data);
                alert('Article added successfully!');
            } catch (error) {
                console.error('Error adding article:', error.response?.data || error.message);
                alert('Error adding article: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    return (
        <div>
            <NavBar user/>
        <div className="container mt-4">
            <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
                <h2 className="mb-4">New Article</h2>

                {/* Title Input */}
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        id="title"
                        className="form-control"
                        placeholder="Enter article title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Body Input */}
                <div className="mb-3">
                    <label htmlFor="body" className="form-label">Body</label>
                    <textarea
                        id="body"
                        className="form-control"
                        placeholder="Enter article content"
                        rows="4"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                    />
                </div>

                {/* Category Checkboxes */}
                <div className="mb-3">
                    <label className="form-label">Categories</label>
                    <div className="d-flex flex-wrap">
                        {categories.map((category) => (
                            <div key={category._id} className="form-check me-3">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    value={category.name}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setKeywordsArray([...keywordsArray, category._id]);
                                        } else {
                                            setKeywordsArray(keywordsArray.filter((keyword) => keyword !== category._id));
                                        }
                                    }}
                                />
                                <label className="form-check-label">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
        </div>
    );
}

export default Reset;

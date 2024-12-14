import React from 'react';
import useFetchUserData from '../hooks/useFetchUserData';
import axiosInstance from '../utils/axiosInstance';
import NavBar from '../components/NavBar';

function Reset() {
    const { user, loading } = useFetchUserData();
    const [title, setTitle] = React.useState('');
    const [body, setBody] = React.useState('');
    const [categories, setCategories] = React.useState([]);
    const [keywordsArray, setKeywordsArray] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const getCategorie = async () => {
        try {
            const response = await axiosInstance.get('/categorie/');
            setCategories(response.data);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }

    };

    React.useEffect(() => {
        getCategorie();
    }, []);

    if (loading || isLoading) {
        return             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
        </div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            alert('Please enter a title');
            return;
        }
        if (!body) {
            alert('Please enter a body');
            return;
        }
        try {
            await axiosInstance.post(
                '/article/addArticle',
                { title, body, categories: keywordsArray },
                { withCredentials: true }
            );
            alert('Article added successfully!');
        } catch (error) {
            alert('Error adding article: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div>
            <NavBar user={user} />
            <div className="bod">
            <div className="container mt-4">
                <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
                    <h2 className="mb-4">New Article</h2>
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
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </div>
        </div>
    );
}

export default Reset;

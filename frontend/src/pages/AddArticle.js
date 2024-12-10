import React from 'react';
import LogoutButton from '../components/LogoutButton';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';
import axiosInstance from '../utils/axiosInstance';



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
    }

    React.useEffect(() => {
        getCategorie();
    }, []);

    if (error || loading || !user) {
        return <UserStatus error={error} loading={loading} user={user} />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!title) {
            alert('Please enter a title');
            return;
        }else if(!body) {
            alert('Please enter a body');
            return;
        }else {
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
        <form onSubmit={handleSubmit}>
            <h2>New Article</h2>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your paragraph here"
                rows="4"
                cols="50"
            />
            {categories.map((category) => (
                <div key={category._id}>
                    <label>
                        <input
                            type="checkbox"
                            value={category.name}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setKeywordsArray([...keywordsArray, category._id]);
                                } else {
                                    setKeywordsArray(keywordsArray.filter((keyword) => keyword !== category._id));
                                }
                            }}
                        />
                        {category.name}
                    </label>
                </div>
            ))}

            
            <button type="submit">Submit</button>
            <LogoutButton setUser={setUser}/>
        </form>
    );
}

export default Reset;

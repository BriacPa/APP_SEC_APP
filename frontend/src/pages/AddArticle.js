import React from 'react';
import LogoutButton from '../components/LogoutButton';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';
import axiosInstance from '../utils/axiosInstance';



function Reset() {
    const { user, error, loading, setUser } = useFetchUserData(); // Use the custom hook
    const [title, setTitle] = React.useState('');
    const [body, setBody] = React.useState('');

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
                    { title, body },
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
            <input
                type="text"
                placeholder="Keywords (comma separated)"
                onChange={(e) => {
                    const keywordsArray = e.target.value.split(',').map(word => word.trim());
                    console.log(keywordsArray);
                }}
            />
            <button type="submit">Submit</button>
            <LogoutButton setUser={setUser}/>
        </form>
    );
}

export default Reset;

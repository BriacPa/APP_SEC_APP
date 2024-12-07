import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const LogoutButton = ({ setUser, setError }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {}, {
                withCredentials: true,
            });
            setUser(null); // Reset user data
            navigate('/login'); // Redirect to the login page
        } catch (err) {
            console.error('Error during logout:', err);
            setError && setError('Error occurred during logout'); // Only call setError if passed as a prop
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;

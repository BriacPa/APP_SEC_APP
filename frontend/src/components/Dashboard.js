import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';


const Dashboard = () => {
    const [user, setUser] = useState(null); // State for user data
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for error handling
    const navigate = useNavigate(); // Hook to navigate programmatically

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axiosInstance.get('/auth/isAuthenticated', {
                    withCredentials: true, // Include cookies (JWT) with the request
                });

                if (response.status === 200) {
                    setUser(response.data.user); // Set user data from the server
                } else {
                    setError('User is not authenticated');
                }
            } catch (err) {
                console.error('Error during authentication check:', err);
                setError('Error occurred during authentication check');
            } finally {
                setLoading(false); // Stop loading after the request completes
            }
        };

        // Fetch user data
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/auth/user', {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    setUser(response.data); // Set user data from the server
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Error occurred while fetching user data');
            }
        };

        fetchUserData(); // Fetch the user data
        checkAuthentication(); // Check if the user is authenticated
    }, []);

    // Logout handler
    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {}, {
                withCredentials: true,
            });
            setUser(null); // Reset user data
            navigate('/login'); // Redirect to the login page
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Error occurred during logout');
        }
    };

    // If still loading, show a loading message
    if (loading) return <p>Loading...</p>;

    // If there's an error, show the error message
    if (error) return <p>{error}</p>;

    // If user is null, show a message or redirect (for unauthorized users)
    if (!user) return <p>User is not authenticated or data is not available.</p>;

    // Once data is loaded and user is available, display the dashboard
    return (
        <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;

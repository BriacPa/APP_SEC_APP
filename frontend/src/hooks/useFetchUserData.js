import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const useFetchUserData = () => {
    const [user, setUser] = useState(null); // State to hold user data
    const [error, setError] = useState(null); // State to handle errors
    const [loading, setLoading] = useState(true); // State to track loading

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/user', {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    setUser(response.data); // Set user data
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Error occurred while fetching user data');
            } finally {
                setLoading(false); // Mark loading as complete
            }
        };

        fetchUserData(); // Fetch user data
    }, []);

    return { user, error, loading, setUser }; // Return states and setUser for manual updates
};

export default useFetchUserData;

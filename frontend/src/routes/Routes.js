import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Ensure this is correctly set up for your axios instance
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';
import Register from '../components/Register';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state to manage initial auth check

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axiosInstance.get('/auth/isAuthenticated', { withCredentials: true });
                if (response.data.isAuthenticated) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false); // In case of error, assume the user is not authenticated
            } finally {
                setLoading(false); // Set loading to false after authentication check
            }
        };

        checkAuthentication();
    }, []);

    if (loading) {
        // Return loading state while authentication check is in progress
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Route */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Redirect if route doesn't exist */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;

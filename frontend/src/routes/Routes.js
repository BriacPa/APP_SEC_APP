import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Ensure this is correctly set up for your axios instance
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ResetPasswordRes from '../pages/ResetPasswordRes';
import ResetPasswordReq from '../pages/ResetPasswordReq';
import ResetPasswordLog from '../pages/ResetPasswordLog';
import AddArticle from '../pages/AddArticle';
import Articles from '../pages/Articles';
import Article from '../pages/Article';
import ChangeMail from '../pages/ChangeMail';
import UserManagment from '../pages/UserManagment';
import ManageUser from '../pages/ManageUser';


const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null); // Add role state
    const [loading, setLoading] = useState(true); // Loading state to manage initial auth check

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axiosInstance.get('/auth/isAuthenticated', { withCredentials: true });
                const user = await axiosInstance.get('/auth/user', { withCredentials: true });

                setIsAuthenticated(response.data.isAuthenticated || false);
                setRole(user.data.role || null); // Set role from response
            } catch (error) {
                // Suppress 403 errors without logging them to the console
                if (error.response?.status === 403) {
                    setIsAuthenticated(false);
                    setRole(null);
                } else {
                    console.error('Error during authentication check:', error);
                }
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
                <Route path="/reset-password" element={<ResetPasswordReq />} />
                <Route path="/reset-password-active" element={<ResetPasswordRes />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/article" element={<Article />} />

                {/* Protected Routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole={['user','author','moderator','admin']} userRole={role}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route
                    path="/add-article"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} 
                        requiredRole={['author','moderator','admin']} 
                        userRole={role}>
                            <AddArticle />
                        </ProtectedRoute>
                    } 
                />
                <Route
                    path="/changeMail"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} 
                        requiredRole={['user','author','moderator','admin']} 
                        userRole={role}>
                            <ChangeMail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reset-password-logged"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} 
                        requiredRole={['user','author','moderator','admin']} 
                        userRole={role}>
                            <ResetPasswordLog />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user-managment"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} 
                        requiredRole={['admin','moderator']} 
                        userRole={role}>
                            <UserManagment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manage-user"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} 
                        requiredRole={['admin','moderator']} 
                        userRole={role}>
                            <ManageUser />
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

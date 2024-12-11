import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import axios from 'axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;



function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogged, setIsLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get('/user', { withCredentials: true });
            setIsLogged(true);
        } catch {
            setIsLogged(false);
            setIsLoading(false);
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!EMAIL_REGEX.test(email)) {
            alert('Invalid email format');
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number');
            return;
        }
        try {
            await axiosInstance.post('/auth/login', { email, password });
            alert('Login successful');
        } catch (err) {
            alert(err.response?.data || 'Error during login');
        } finally {
            fetchUser();
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if(isLogged) {
        window.location.href = '/dashboard';
    }

    if(isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;

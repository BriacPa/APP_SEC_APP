import React, { useState } from 'react';
import axios from 'axios';

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

function Reset() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        // Reset error message
        setError('');

        // Extract email token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const code = urlParams.get('code');

        
        if (!token) {
            setError('Invalid or missing token.');
            return;
        }

        if (!code) {
            setError('Invalid or missing code.');
            return;
        }

        // Validate password
        if (!PASSWORD_REGEX.test(password)) {
            setError(
                'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number.'
            );
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/resetPass/RP', {token, password, confirmPassword, code });
            alert('Reset successful');
        } catch (err) {
            setError(err.response?.data?.error || 'Error during reset');
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h2>New Password</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <button type="submit">Submit</button>
        </form>
    );
}

export default Reset;

import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

function Reset() {
    const [email, setEmail] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/resetPass', { email });
            alert('CheckYourMails');
        } catch (err) {
            alert(err.response?.data || 'Error');
        }
    };

    return (
        <form onSubmit={handleReset}>
            <h2>Reset Password</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
            <button type="submit">Submit</button>
        </form>
    );
}

export default Reset;

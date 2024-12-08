import axiosInstance from "../utils/axiosInstance";
import React, { useState } from "react";

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

const ResetPasswordLog = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const submitPass = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) setError('Passwords do not match.');
        if (!PASSWORD_REGEX.test(password)) setError('Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number.');
        await axiosInstance.post('/user/change-password', { password, confirmPassword }, { withCredentials: true })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div>
            <h1>Reset Password Log</h1>
            <form onSubmit={submitPass}>
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
        </div>
    );
    }

export default ResetPasswordLog;
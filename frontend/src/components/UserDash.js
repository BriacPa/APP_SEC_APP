import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const UserDash = ({ user, setUser, setError }) => {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(false);

    const changeMail = () => {
        window.location.href = '/dashboard/changeMail';
    };

    const changePass = () => {
        window.location.href = '/dashboard/reset-password-logged';
    };

    const deleteAccount = async () => {
        try {
            await axiosInstance.post('/user/delete-account-req', { withCredentials: true });
            setShowAlert(true);
            console.log('Account deletion request sent.');

            await axiosInstance.post('/auth/logout', {}, {
                withCredentials: true,
            });
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Error during account deletion:', err);
            setError && setError('Error occurred during account deletion or logout');
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mr-3">Welcome, {user.username}!</h1>
                <div className="d-flex gap-2">
                    <button onClick={changeMail} className="btn btn-primary">Change Email</button>
                    <button onClick={changePass} className="btn btn-warning">Reset Password</button>
                    <button onClick={deleteAccount} className="btn btn-danger">Delete Account</button>
                </div>
            </div>
            {showAlert && <div className="alert alert-success">Delete account email sent successfully.</div>}
        </div>
    );
};

export default UserDash;

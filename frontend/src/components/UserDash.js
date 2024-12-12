import LogoutButton from '../components/LogoutButton';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const UserDash = ({ user, setUser, setError }) => {
    const navigate = useNavigate();

    const changeMail = () => {
        window.location.href = '/changeMail';
    };

    const changePass = () => {
        window.location.href = '/reset-password-logged';
    };
    
    const deleteAccount = async () => {
        await axiosInstance.post('/user/delete-account-req', { withCredentials: true })
            .then((res) => {
                alert('Delete account email sent');
                console.log(res);
                try {
                    axiosInstance.post('/auth/logout', {}, {
                        withCredentials: true,
                    });
                    setUser(null); // Reset user data
                    navigate('/login'); // Redirect to the login page
                } catch (err) {
                    console.error('Error during logout:', err);
                    setError && setError('Error occurred during logout'); // Only call setError if passed as a prop
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>
            <div className="d-grid gap-2">
                <button onClick={changeMail} className="btn btn-primary">Change Email</button>
                <button onClick={changePass} className="btn btn-warning">Reset Password</button>
                <button onClick={deleteAccount} className="btn btn-danger">Delete Account</button>
            </div>
            <p className="mt-3">Role: {user.role}</p>
            <LogoutButton setUser={setUser} />
        </div>
    );
}

export default UserDash;

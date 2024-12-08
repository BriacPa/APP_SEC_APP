import LogoutButton from '../components/LogoutButton';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const UserDash = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

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
    }
    return (
        <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>
            <button onClick={changeMail}>Change Email</button>
            <button onClick={changePass}>Reset Password</button>
            <button onClick={deleteAccount}>Delete Account</button>
            <p>Role: {user.role}</p>
            {/* Use the LogoutButton component */}
            <LogoutButton setUser={setUser} />
        </div>
    );

}

export default UserDash;
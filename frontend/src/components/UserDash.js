import LogoutButton from '../components/LogoutButton';
import axiosInstance from '../utils/axiosInstance';

const UserDash = ({ user, setUser }) => {
        

    const changeMail = () => {
        window.location.href = '/changeMail';
    };

    const changePass = () => {
        window.location.href = '/reset-password-logged';
    };
    const deleteAccount = async () => {
        await axiosInstance.post('/user/delete-account-req', { withCredentials: true })
            .then((res) => {
                console.log(res);
                setUser(null);
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
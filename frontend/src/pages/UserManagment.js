import axiosInstance from '../utils/axiosInstance';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserManagment = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading2, setLoading2] = useState(true);
    const [userU, setUserU] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserU = async () => {
            try {
                const response = await axiosInstance.get('/user', {
                    withCredentials: true,
                });
            } catch (err) {
            }
    };
    fetchUserU()
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user', {
                    withCredentials: true,
                });
                setUserU(response.data);
            } catch (err) {
            } finally {
                setLoading(false); // Mark loading as complete
            }
        };

        fetchUser();
    }, []);


    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                await axiosInstance.get('/auth/isAuthenticated', {
                    withCredentials: true,
                });
                setIsAuthenticated(true);
                console.log('Authenticated');
            } catch (err) {
                setIsAuthenticated(false);
                console.log('Not Authenticated');
            }  finally {
                setLoading2(false); // Mark loading as complete
            }
        };
        checkAuthentication();
    }, []);



    

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/user/all-users');
                setUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const goToUser = async (userID) => {
        try {
            const url = "/manage-user/?UserID=" + userID;
            navigate(url);
            console.log(window.location.origin + url);
        } catch(err) {
            console.log(err)
        }
    }

    const canManage = (role) => {
        if(role === 'admin' || (role === 'moderator' && userU.role === 'moderator')) {
            return false;
        } else if((role === 'moderator' && userU.role === 'admin') || (role === 'user' || role === 'author')) {
            return true;
        }
    }

    if(loading || loading2) {
        return <div>Loading...</div>;
    }

    return (
        <div>
        <h1>User Managment</h1>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{canManage(user.role)  ? <button onClick={() => goToUser(user._id)}>Action</button> : null}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
    };

export default UserManagment;
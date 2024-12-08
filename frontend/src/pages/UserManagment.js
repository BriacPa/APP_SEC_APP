import axiosInstance from '../utils/axiosInstance';
import { useEffect, useState } from 'react';

const UserManagment = () => {
    const [users, setUsers] = useState([]);

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
                        <td><button>Action</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
    };

export default UserManagment;
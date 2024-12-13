import axiosInstance from '../utils/axiosInstance';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import NavBar from '../components/NavBar';

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
        fetchUserU();
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
            } finally {
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
            const url = "/user-managment/manage-user/?UserID=" + userID;
            navigate(url);
            console.log(window.location.origin + url);
        } catch (err) {
            console.log(err);
        }
    };

    const canManage = (role) => {
        if (role === 'admin' || (role === 'moderator' && userU.role === 'moderator')) {
            return false;
        } else if ((role === 'moderator' && userU.role === 'admin') || (role === 'user' || role === 'author')) {
            return true;
        }
    };

    if (loading || loading2) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
    <>
        <NavBar user = {userU}/>
        <div class="bod2">
        <Container className="mt-5">
            <h1>User Management</h1>
            <Row className="mb-4">
                <Col>
                    <Table striped bordered hover responsive>
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
                                    <td>
                                        {canManage(user.role) && (
                                            <Button
                                                variant="primary"
                                                onClick={() => goToUser(user._id)}
                                                className="btn-sm"
                                            >
                                                Manage
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
        </div>
        </>
    );
};

export default UserManagment;

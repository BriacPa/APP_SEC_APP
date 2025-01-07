import axiosInstance from '../utils/axiosInstance';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import NavBar from '../components/NavBar';

const UserManagment = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userU, setUserU] = useState();
    const navigate = useNavigate();
    const [loading3, setLoading3] = useState(true);
    const [loading4, setLoading4] = useState(true);

    useEffect(() => {
        const fetchUserU = async () => {
            try {
                await axiosInstance.get('/user', { withCredentials: true });
            } catch (err) {
            } finally {
                setLoading3(false);
            }
        };
        fetchUserU();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user', { withCredentials: true });
                setUserU(response.data);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/user/all-users');
                setUsers(response.data);
            } catch (error) {
            } finally {
                setLoading4(false);
            }
        };
        fetchUsers();
    }, []);

    const goToUser = async (userID) => {
        try {
            const url = "/user-managment/manage-user/?UserID=" + userID;
            navigate(url);
        } catch (err) {
        }
    };

    const canManage = (role) => {
        if (role === 'admin' || (role === 'moderator' && userU.role === 'moderator')) {
            return false;
        } else if ((role === 'moderator' && userU.role === 'admin') || (role === 'user' || role === 'author')) {
            return true;
        }
    };

    if (loading || loading3 || loading4) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
            </div>
        );
    }

    return (
        <>
            <NavBar user={userU} />
            <div className="bod2">
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

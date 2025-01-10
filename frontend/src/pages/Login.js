import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Button, Alert, Container, Row, Col, Form } from 'react-bootstrap';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogged, setIsLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get('/user', { withCredentials: true });
            setUser(response.data);
            setIsLogged(true);
        } catch (err) {
            setIsLogged(false);
            console.error('Error fetching user:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!EMAIL_REGEX.test(email)) {
            setErrorMessage('Invalid email format');
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            setErrorMessage('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number');
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.post('/auth/login', { email, password });
            fetchUser(); // This updates the user state after login
            window.location.reload();
        } catch (err) {
            console.log('Login error:', err);
            setErrorMessage(err.response?.data?.message || 'Error during login');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isLogged) {
            fetchUser();
        }
    }, [isLogged]);

    // useEffect(() => {
    //     if (isLogged) {
    //         window.location.reload();

    //         navigate('/');
    //     }
    // }, [isLogged, navigate]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
            </div>
        );
    }

    return (
        <>
        <NavBar user={user} />
        <Container fluid="md" className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto p-4 border rounded shadow-lg bg-light">
                    <h1 className="text-center mb-4">Login</h1>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label className="mb-1">Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Ex : johndoe@mail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label className="mb-1">Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Enter your password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p>Don't have an account? <a href="/register">Sign up</a></p>
                        {/* <p><a href="/reset-password">Forgot your password?</a></p> */}
                    </div>
                </Col>
            </Row>
        </Container>
        </>
    );
}

export default Login;

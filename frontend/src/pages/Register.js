import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Button, Alert, Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import NavBar from '../components/NavBar';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState({});

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get('/user', { withCredentials: true });
            setIsLogged(true);
            setUser(response.data);
        } catch {
            setIsLogged(false);
        } finally {
            setIsLoading(false);
        };
    };
            

    const handleRegister = async (e) => {
        e.preventDefault();

        // Reset error message
        setError('');

        // Validate email
        if (!EMAIL_REGEX.test(email)) {
            setError('Invalid email format.');
            return;
        }

        // Validate password
        if (!PASSWORD_REGEX.test(password)) {
            setError(
                'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number.'
            );
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await axiosInstance.post('/auth/register', { username, email, password, confirmPassword });
            setSuccess('Check your email to verify your account');
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Username or email already in use');
            } else if (err.response?.status === 400) {
                setError('Invalid data');
            } else {
            setError('Error during registration');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }
    , []);

    if (isLogged) {
        window.location.href = '/dashboard';
    }

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
                    <h1 className="text-center mb-4">Register</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleRegister}>
                        <Form.Group controlId="formUsername" className="mb-3">
                            <Form.Label className="mb-1">Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ex : JohnDoe123" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </Form.Group>

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
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group controlId="formConfirmPassword" className="mb-3">
                            <Form.Label className="mb-1">Confirm Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner animation="border" variant="light" size="sm" /> : 'Register'}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <p>Already have an account? <a href="/login">Login</a></p>
                    </div>
                </Col>
            </Row>
        </Container>
        </>
    );
}

export default Register;

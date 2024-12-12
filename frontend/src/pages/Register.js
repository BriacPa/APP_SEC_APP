import React, { useState } from 'react';
import axios from 'axios';
import { Button, Alert, Container, Row, Col, Form, Spinner } from 'react-bootstrap';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            await axios.post('http://localhost:5000/api/auth/register', { username, email, password, confirmPassword });
            alert('Registration successful');
        } catch (err) {
            setError(err.response?.data?.error || 'Error during registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fluid="md" className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto p-4 border rounded shadow-lg bg-light">
                    <h1 className="text-center mb-4">Register</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
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
    );
}

export default Register;

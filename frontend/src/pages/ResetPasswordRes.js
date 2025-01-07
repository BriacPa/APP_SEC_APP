import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';
import axiosInstance from '../utils/axiosInstance';


const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

function Reset() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

    const getUser = async () => {
        try {
            const response = await axiosInstance.get('/user/', { withCredentials: true });
            setUser(response.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();

        // Reset error message
        setError('');

        // Extract email token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const code = urlParams.get('code');

        if (!token) {
            setError('Invalid or missing token.');
            return;
        }

        if (!code) {
            setError('Invalid or missing code.');
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

        try {
            await axiosInstance.post('/resetPass/RP', { token, password, confirmPassword, code });
            setSuccess('Password reset successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Error during reset');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
            </div>
        );
    }

    return (
        <>
        <NavBar user={user} />
        <div className='bod2'>
        <Container className="mt-5">
            <div className="d-flex justify-content-center">
                <Form onSubmit={handleRegister} style={{ maxWidth: '400px', width: '100%' }}>
                    <h2 className="mb-4 text-center">Set New Password</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" block>
                        Submit
                    </Button>
                </Form>
            </div>
        </Container>
        </div>
        </>
    );
}

export default Reset;

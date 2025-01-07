import axiosInstance from "../utils/axiosInstance";
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import NavBar from '../components/NavBar';

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

const ResetPasswordLog = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const submitPass = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            setError('Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        try {
            await axiosInstance.post('/user/change-password', { password, confirmPassword }, { withCredentials: true });
            alert('Password changed successfully');
        } catch (err) {
            setError(err.response?.data?.error || 'Error during password reset');
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
            <div className="d-flex align-items-center justify-content-center vh-100">
                <Container>
                    <div className="d-flex justify-content-center">
                        <Form onSubmit={submitPass} style={{ maxWidth: '400px', width: '100%' }}>
                            <h2 className="mb-4 text-center">Reset Password</h2>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formConfirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">
                                Submit
                            </Button>
                        </Form>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default ResetPasswordLog;

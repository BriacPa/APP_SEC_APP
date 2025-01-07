import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Container, Form, Button, Alert } from "react-bootstrap";
import NavBar from '../components/NavBar';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ChangeMail = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);  // Set initial state of user to null
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user/', { withCredentials: true });
                setUser(response.data);
                setLoading(false); // Set loading to false once the user is fetched
            } catch (error) {
                setLoading(false); // Set loading to false even if the fetch fails
            }
        };
        fetchUser();
    }, []);

    const submitEmail = async (e) => {
        e.preventDefault();
        
        // Reset error and success messages
        setError('');
        setSuccess('');

        // Validate email format
        if (!EMAIL_REGEX.test(email)) {
            setError('Invalid email format.');
            return;
        }

        try {
            // Make the request to change the email
            await axiosInstance.post('/user/change-email', { email }, { withCredentials: true });
            setSuccess('Email changed successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Error occurred while changing email.');
        }
    };

    // Conditionally render the NavBar if the user is fetched
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
                        <Form onSubmit={submitEmail} style={{ maxWidth: '400px', width: '100%' }}>
                            <h2 className="mb-4 text-center">Change Email</h2>

                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>New Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your new email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                    required
                                />
                            </Form.Group>

                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100" // Replaced block with w-100 for full width
                                disabled={!EMAIL_REGEX.test(email)} // Disable button if email format is invalid
                            >
                                Change Email
                            </Button>
                        </Form>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default ChangeMail;

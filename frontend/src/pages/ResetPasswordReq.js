import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';


function Reset() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/resetPass', { email });
            setMessage('Check your email for password reset instructions.');
            setError('');
        } catch (err) {
            setError(err.response?.data || 'An error occurred');
            setMessage('');
        }
    };

    return (
        <Container className="mt-5">
            <div className="d-flex justify-content-center">
                <Form onSubmit={handleReset} style={{ maxWidth: '400px', width: '100%' }}>
                    <h2 className="mb-4 text-center">Reset Password</h2>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Enter email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" block>
                        Submit
                    </Button>

                    {message && (
                        <Alert variant="success" className="mt-3">
                            {message}
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="danger" className="mt-3">
                            {error}
                        </Alert>
                    )}
                </Form>
            </div>
        </Container>
    );
}

export default Reset;

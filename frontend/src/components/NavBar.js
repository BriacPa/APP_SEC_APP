import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

function NavigationBar({ user, onLogout }) {
    const navigate = useNavigate();
    const [page, setPage] = useState();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
            navigate('/login');
        } catch (err) {}
    };

    const findPage = () => {
        const url = window.location.href;
        setPage(url.split("/")[3]);
    };

    useEffect(() => {
        findPage();
    }, [page]);

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <Navbar style={{ background: '#00618E', color: 'white', position: 'fixed', top: '0', left: '0', width: '100%', height: '60px', zIndex: '1000' }} expand="lg">
            <Container>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="ml-auto">
                        {["", "#learn-more", "login", "register","reset-password"].includes(page) ? (
                            <Nav.Link as={Link} to="/" style={{ color: 'white' }} className="fw-bold">Home</Nav.Link>
                        ) : (
                            <Nav.Link as={Link} to="/" style={{ color: 'white' }}>Home</Nav.Link>
                        )}
                        {user._id && (
                            <>
                                {page === "dashboard" ? (
                                    <Nav.Link as={Link} to="/dashboard" style={{ color: 'white' }} className="fw-bold">Dashboard</Nav.Link>
                                ) : (
                                    <Nav.Link as={Link} to="/dashboard" style={{ color: 'white' }}>Dashboard</Nav.Link>
                                )}
                            </>
                        )}
                        {page === "articles" ? (
                            <Nav.Link as={Link} to="/articles" style={{ color: 'white' }} className="fw-bold">Articles</Nav.Link>
                        ) : (
                            <Nav.Link as={Link} to="/articles" style={{ color: 'white' }}>Articles</Nav.Link>
                        )}
                        {user && (user.role === 'admin' || user.role === 'moderator') && (
                            <>
                                {page === "user-managment" ? (
                                    <Nav.Link as={Link} to="/user-managment" style={{ color: 'white' }} className="fw-bold">Users</Nav.Link>
                                ) : (
                                    <Nav.Link as={Link} to="/user-managment" style={{ color: 'white' }}>Users</Nav.Link>
                                )}
                            </>
                        )}
                        {user && user.role === 'admin' && (
                            page === "categories" ? (
                                <Nav.Link as={Link} to="/categories" style={{ color: 'white' }} className="fw-bold">Categories</Nav.Link>
                            ) : (
                                <Nav.Link as={Link} to="/categories" style={{ color: 'white' }}>Categories</Nav.Link>
                            )
                        )}
                        {(user.role === 'admin' || user.role === 'moderator' || user.role === 'author') && (
                            page === "add-article" ? (
                                <Nav.Link as={Link} to="/add-article" style={{ color: 'white' }} className="fw-bold">Create Article</Nav.Link>
                            ) : (
                                <Nav.Link as={Link} to="/add-article" style={{ color: 'white' }}>Create Article</Nav.Link>
                            )
                        )}
                    </Nav>
                    <Nav className="ms-auto">
                        <Nav.Item>
                            {user._id ? (
                                <Button variant="danger" onClick={handleLogout} className="ml-3">Logout</Button>
                            ) : (
                                <Button variant="success" onClick={handleLoginRedirect} className="ml-3">Login</Button>
                            )}
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;

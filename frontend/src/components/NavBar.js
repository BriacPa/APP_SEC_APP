import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';  // Assuming you are using React Router for navigation

function NavigationBar({ user, onLogout }) {
    const navigate = useNavigate();  // To programmatically navigate after logout

    const handleLogout = () => {
        // Call your logout logic here (e.g., clear cookies, tokens, etc.)
        // Example: localStorage.removeItem("authToken"); or any other logout logic
        onLogout();

        // Redirect to login page after logging out
        navigate('/login');
    };

    return (
        <Navbar style={{background: '#483d8b'}} expand="lg">
            <Container>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/articles">Articles</Nav.Link>

                        {/* Show 'Users' link for admin and moderator roles */}
                        {user.role === 'admin' || user.role === 'moderator' ? (
                            <Nav.Link as={Link} to="/users">Users</Nav.Link>
                        ) : null}

                        {/* Show 'Categories' link only for admins */}
                        {user.role === 'admin' ? (
                            <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
                        ) : null}

                        {/* Logout button on the far right */}
                        <Nav.Item>
                            <Button 
                                variant="outline-danger" 
                                onClick={handleLogout} 
                                className="ml-3">
                                Logout
                            </Button>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;

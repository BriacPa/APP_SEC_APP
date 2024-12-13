import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const [user, setUser] = useState({});

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user', { credentials: 'include' });
            const data = await response.json();
            setUser(data);
        } catch (error) {
            setUser({});
            console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="bod">
            <NavBar user={user} />
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                <div className="container text-center py-5">
                    <h1 className="display-4 text-primary mb-4">Welcome to the Home Page</h1>
                    
                    {user?.name ? (
                        <h3 className="text-success">Hello, {user.name}!</h3>
                    ) : (
                        <p className="lead text-muted">You're not logged in. Please log in to access your account.</p>
                    )}

                    <p className="lead text-dark mb-4">
                        This app is an exercise for Dr. Michał Apolinarski's class on application security.
                    </p>

                    <div className="flip-container mt-4 mb-4">
                        <div className="flipper">
                            {/* Front Side: Logo */}
                            <div className="front">
                                <img
                                    src={require('../assets/images/put.png')}
                                    alt="Logo"
                                    className="img-fluid logo"
                                />
                            </div>

                            {/* Back Side: Kilroy Image */}
                            <div className="back">
                                <img
                                    src={require('../assets/images/kilroy.png')}
                                    alt="Kilroy"
                                    className="img-fluid kilroy"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">What is this app?</h5>
                                    <p className="card-text">
                                        This application serves as a demonstration of security concepts including user authentication, secure data storage, and protection against common web vulnerabilities. It's an interactive environment to explore secure application design.
                                    </p>
                                    <a href="/#learn-more" className="btn btn-primary">Learn More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline CSS for Flip Animation and Disk */}
            <style jsx>{`
                .flip-container {
                    perspective: 1000px; /* Gives depth to the 3D effect */
                    display: inline-block; /* Ensures the flip container is only as wide as its contents */
                    justify-content: center;
                    align-items: center;
                    background-color: transparent; /* Ensure the container has a transparent background */
                    cursor: pointer; /* Makes it clear that it's interactive */
                }

                .flipper {
                    width: 300px; /* Width of the flip container */
                    height: 300px; /* Height of the flip container */
                    transform-style: preserve-3d;
                    transition: transform 0.6s;
                    position: relative;
                }

                .flip-container:hover .flipper {
                    transform: rotateY(180deg); /* Flip the container when hovered */
                }

                .front, .back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    backface-visibility: hidden; /* Prevents the back from showing when flipped */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: transparent; /* Ensure background is transparent */
                }

                .front {
                    /* Ensure the front side has the image */
                    background-color: transparent; /* Optional: remove background */
                }

                .back {
                    /* Ensure the back side has the second image */
                    transform: rotateY(180deg); /* Make the back side rotate 180 degrees */
                    background-color: transparent; /* Optional: remove background */
                }

                .logo, .kilroy {
                    max-width: 100%;
                    max-height: 100%;
                }
            `}</style>
        </div>
    );
}

export default Home;

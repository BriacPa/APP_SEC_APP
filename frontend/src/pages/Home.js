import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import axiosInstance from '../utils/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await axiosInstance.get('/user/', { withCredentials: true });
            setUser(response.data);
        } catch (error) {
            setUser({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

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
            <div className="bod">
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
                            <div className="front">
                                <img
                                    src={require('../assets/images/put.png')}
                                    alt="Logo"
                                    className="img-fluid logo"
                                />
                            </div>
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

            {/* Removed the jsx attribute to fix the warning */}
            <style>
                {`
                .flip-container {
                    perspective: 1000px;
                    display: inline-block;
                    justify-content: center;
                    align-items: center;
                    background-color: transparent;
                    cursor: pointer;
                }

                .flipper {
                    width: 300px;
                    height: 300px;
                    transform-style: preserve-3d;
                    transition: transform 0.6s;
                    position: relative;
                }

                .flip-container:hover .flipper {
                    transform: rotateY(180deg);
                }

                .front, .back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    backface-visibility: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: transparent;
                }

                .front {
                    background-color: transparent;
                }

                .back {
                    transform: rotateY(180deg);
                    background-color: transparent;
                }

                .logo, .kilroy {
                    max-width: 100%;
                    max-height: 100%;
                }
                `}
            </style>
        </div>
        </>
    );
}

export default Home;

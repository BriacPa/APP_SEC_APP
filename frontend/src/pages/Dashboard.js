import React from 'react';
import useFetchUserData from '../hooks/useFetchUserData';
import UserDash from '../components/UserDash';
import Comments from '../components/Comments';
import RatingDash from '../components/RatingDash';
import ArticlesDash from '../components/ArticlesDash';
import NavBar from '../components/NavBar';
import { Card, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
    const { user, loading, setUser } = useFetchUserData();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
            </div>
        );
    }

    return (
        <div>
            <NavBar user={user} />
            <div className="bod2">
            <div className="container mt-4">
                <Card className="bg-light p-4 rounded shadow-sm mb-4">
                    <UserDash user={user} setUser={setUser} />
                </Card>
                <Row className="mb-4">
                    <Col md={6}>
                        <Card className="bg-light p-4 rounded shadow-sm">
                            <Comments user={user} setUser={setUser} />
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="bg-light p-4 rounded shadow-sm">
                            <RatingDash user={user} setUser={setUser} />
                        </Card>
                    </Col>
                </Row>
                {(user.role === 'author' || user.role === 'moderator' || user.role === 'admin') && (
                    <Card className="bg-light p-4 rounded shadow-sm mb-4">
                        <ArticlesDash user={user} setUser={setUser} />
                    </Card>
                )}
            </div>
        </div>
        </div>
    );
};

export default Dashboard;

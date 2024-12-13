import React from 'react';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';
import UserDash from '../components/UserDash';
import Comments from '../components/Comments';
import RatingDash from '../components/RatingDash';
import ArticlesDash from '../components/ArticlesDash';
import NavBar from '../components/NavBar';
import { Card, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
    const { user, error, loading, setUser, setError } = useFetchUserData(); // Use the custom hook

    if (error || loading || !user) {
        return <UserStatus error={error} loading={loading} user={user} />;
    }

    return (
        <div>
            <NavBar user={user} />*
            <div class="bod">
            <div className="container mt-4">
                <Card className="bg-light p-4 rounded shadow-sm mb-4">
                    <UserDash user={user} setUser={setUser} />
                </Card>
                {/* Grid row for Comments and RatingDash */}
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
                {/* Conditional rendering for ArticlesDash */}
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

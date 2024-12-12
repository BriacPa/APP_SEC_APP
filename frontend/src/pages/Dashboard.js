import React from 'react';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';
import UserDash from '../components/UserDash';
import Comments from '../components/Comments';
import RatingDash from '../components/RatingDash';
import ArticlesDash from '../components/ArticlesDash';
import NavBar from '../components/NavBar';

const Dashboard = () => {
    const { user, error, loading, setUser, setError } = useFetchUserData(); // Use the custom hook

    if (error || loading || !user) {
        return <UserStatus error={error} loading={loading} user={user} />;
    }

    return (
        <div>
            <NavBar user={user} />
            <div className="container mt-4">
                <UserDash user={user} setUser={setUser} />
                <Comments user={user} setUser={setUser} />
                <RatingDash user={user} setUser={setUser} />
                {(user.role === 'author' || user.role === 'moderator' || user.role === 'admin') && (
                    <ArticlesDash user={user} setUser={setUser} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;

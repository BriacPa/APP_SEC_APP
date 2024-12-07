import React from 'react';
import LogoutButton from '../components/LogoutButton';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';

const Dashboard = () => {
    const { user, error, loading, setUser } = useFetchUserData(); // Use the custom hook

    // Check the status of the user using the UserStatus component
    if (error || loading || !user) {
        return <UserStatus error={error} loading={loading} user={user} />;
    }

    // Once data is loaded and user is available, display the dashboard
    return (
        <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            {/* Use the LogoutButton component */}
            <LogoutButton setUser={setUser} />
        </div>
    );
};

export default Dashboard;

import React from 'react';
import useFetchUserData from '../hooks/useFetchUserData';
import UserStatus from '../components/UserStatus';
import UserDash from '../components/UserDash';

const Dashboard = () => {
    const { user, error, loading, setUser } = useFetchUserData(); // Use the custom hook

    // Check the status of the user using the UserStatus component
    if (error || loading || !user) {
        return <UserStatus error={error} loading={loading} user={user} />;
    }

    // Once data is loaded and user is available, display the dashboard
    return <UserDash user={user} setUser={setUser} />;
};

export default Dashboard;

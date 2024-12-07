const UserStatus = ({ error, loading, user }) => {
    if (error) return <p>{error}</p>; // Show the error message if an error exists
    if (loading) return <p>Loading...</p>; // Show loading state
    if (!user) return <p>User is not authenticated or data is not available.</p>; // Handle no user case

    return null; // If no error/loading/user issues, return nothing
};

export default UserStatus;

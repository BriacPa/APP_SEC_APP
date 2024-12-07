import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, requiredRole, userRole, children }) => {
    const roles = Array.isArray(userRole) ? userRole : [userRole];
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    else if (!requiredRoles.some(role => roles.includes(role))) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;

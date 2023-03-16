import React from 'react';
import useAuth from '../hooks/useAuth';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

const RequireAuthWithRoles = ({ allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  return allowedRoles.find((element) => auth?.userData?.role === element) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  );
};

export default RequireAuthWithRoles;

import React from 'react';
import useAuth from '../hooks/useAuth';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

const RequireAuthWithPosition = ({ allowedPosition, checkRole }) => {
  const { auth } = useAuth();
  const location = useLocation();

  return checkRole.find((element) => auth?.userData?.role === element) ? (
    allowedPosition.find((element) => auth?.userData?.jabatan === element) ? (
      <Outlet />
    ) : (
      <Navigate to="/unauthorized" state={{ from: location }} replace />
    )
  ) : (
    <Outlet />
  );
};

export default RequireAuthWithPosition;

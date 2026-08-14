import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'COMMISSIONER' | 'CANDIDATE' | 'VOTER';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, voterSession, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Verifying credentials..." />;
  }

  if (allowedRole === 'COMMISSIONER') {
    if (!user || user.role !== 'COMMISSIONER') {
      return <Navigate to="/commissioner/login" state={{ from: location }} replace />;
    }
  }

  if (allowedRole === 'CANDIDATE') {
    if (!user || user.role !== 'CANDIDATE') {
      return <Navigate to="/candidate/login" state={{ from: location }} replace />;
    }
  }

  if (allowedRole === 'VOTER') {
    if (!voterSession) {
      return <Navigate to="/vote" replace />;
    }
  }

  return <>{children}</>;
};

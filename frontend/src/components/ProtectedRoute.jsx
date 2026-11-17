import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { store } from '../services/store';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const auth = store.getAuth();
  if (!auth.isAuthenticated || !store.getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

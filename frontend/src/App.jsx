import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadHubPage from './pages/UploadHubPage';
import UploadFormPage from './pages/UploadFormPage';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import JournalViewPage from './pages/JournalViewPage';
import ProtectedRoute from './components/ProtectedRoute';

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="route-fade-stage">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
        <Route path="/view/:id" element={<JournalViewPage />} />

        {/* Protected Routes */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-form"
          element={
            <ProtectedRoute>
              <UploadFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <div className="app-boot-shell">
          <AnimatedRoutes />
        </div>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

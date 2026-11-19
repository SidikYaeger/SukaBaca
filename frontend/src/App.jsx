import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Routes>
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
      </SubscriptionProvider>
    </AuthProvider>
  );
}

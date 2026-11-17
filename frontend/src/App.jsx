import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeviceFrame from './components/DeviceFrame';
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
import { store } from './services/store';

export default function App() {
  const initialAuth = store.getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuthenticated);
  const [currentUser, setCurrentUser] = useState(initialAuth.user);

  const handleLoginSuccess = (userData) => {
    store.setAuth(userData);
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    store.clearAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <DeviceFrame>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route 
          path="/home" 
          element={
            <HomePage 
              isAuthenticated={isAuthenticated} 
              onLogout={handleLogout} 
            />
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <LoginPage 
              onLoginSuccess={handleLoginSuccess} 
            />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <RegisterPage />
          } 
        />
        
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <UploadHubPage 
                onLogout={handleLogout} 
              />
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
          path="/search" 
          element={
            <SearchPage 
              onLogout={handleLogout} 
            />
          } 
        />
        
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <HistoryPage 
                onLogout={handleLogout} 
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/journal/:id" 
          element={
            <JournalViewPage />
          } 
        />
        
        <Route 
          path="/article/:id" 
          element={
            <ArticleDetailPage />
          } 
        />
        
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </DeviceFrame>
  );
}

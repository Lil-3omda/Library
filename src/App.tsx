import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { AppProvider } from './context/AppContext';
import { LoginPage } from './components/Auth/LoginPage';
import { LibraryApp } from './components/LibraryApp';
import { LoadingSpinner } from './components/LoadingSpinner';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/" /> : <LoginPage />} 
        />
        <Route 
          path="/*" 
          element={currentUser ? <LibraryApp /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
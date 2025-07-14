import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files/*" element={<Files />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

export default App;

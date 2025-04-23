import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CaptainDashboard from './pages/captain/CaptainDashboard';
import TournamentList from './pages/TournamentList';
import TournamentDetails from './pages/TournamentDetails';
import TeamRegistration from './pages/captain/TeamRegistration';
import PlayerRegistration from './pages/captain/PlayerRegistration';
import TFTRegistration from './pages/player/TFTRegistration';
import BracketView from './pages/BracketView';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [user, setUser] = useState(localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null);

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header user={user} setUser={setUser} />
      <main className="flex-grow-1 py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage setUser={setUser} />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/brackets/:id" element={<BracketView />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Captain Routes */}
            <Route 
              path="/captain" 
              element={
                <ProtectedRoute allowedRoles={['captain', 'admin']}>
                  <CaptainDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/captain/team/register" 
              element={
                <ProtectedRoute allowedRoles={['captain', 'admin']}>
                  <TeamRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/captain/player/register" 
              element={
                <ProtectedRoute allowedRoles={['captain', 'admin']}>
                  <PlayerRegistration />
                </ProtectedRoute>
              } 
            />
            
            {/* Player Routes */}
            <Route 
              path="/player/tft/register" 
              element={
                <ProtectedRoute allowedRoles={['player', 'admin']}>
                  <TFTRegistration />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default App;

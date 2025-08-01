import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTest from './components/CreateTest';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-test" element={<CreateTest />} />
      </Routes>
    </Router>
  );
};

export default App;

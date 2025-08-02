import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTest from './components/CreateTest';
import EditTest from './components/EditTest';       // ✅ Import EditTest
import AttendTest from './components/AttendTest';   // ✅ Import AttendTest
import AISurveyCreator from './pages/AISurveyCreator';
import SurveyAttendingPage from './pages/SurveyAttendingPage';
import ViewResponsesPage from './pages/ViewResponsesPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/edit-test/:testId" element={<EditTest />} />
        <Route path="/attend-test/:testId" element={<AttendTest />} />
        <Route path="/ai-survey" element={<AISurveyCreator/>}/>
        <Route path="/survey/:surveyId" element={<SurveyAttendingPage />} />
        <Route path="/survey-responses/:surveyId" element={<ViewResponsesPage />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
};

export default App;

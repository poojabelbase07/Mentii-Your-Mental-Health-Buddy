// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Keep useAuth from your file
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import SentimentalAnalysis from './components/modules/SentimentalAnalysis';
// import CBTChatbot from './components/modules/CBTJournalEntryDetail'; // REMOVED: Replaced by partner's CBT Journaling components
import ColorPsychology from './components/modules/ColorPsychology';
import FinalResult from './components/modules/FinalResult';
import Profile from './components/layout/Profile';
import Home from './components/Home';

// Style imports (activated from partner's file, were commented in yours)
import './styles/Auth.css';
import './styles/modules.css';

// YOUR UNIQUE IMPORTS
import Games from "./pages/Games";
import Activities from './pages/Activities';
import SleepTracker from './activities/SleepTracker';
import ExerciseTracker from './activities/ExerciseTracker';

// PARTNER'S NEW CBT JOURNAL IMPORTS
import CBTJournalList from './components/modules/CBTJournalList';
import CBTJournalEntryForm from './components/modules/CBTJournalEntryForm';
import CBTJournalEntryDetail from './components/modules/CBTJournalEntryDetail'; // Note: Partner's correct import for journal detail

import MentalHealthResourcesPage from './pages/MentalHealthResourcesPage';

import ForgotPassword from './components/auth/ForgotPassword';

// Optional: Keep commented if you might need them later
import CalmZone from '../src/pages/Calmzone';
// import ForgotPassword from './pages/Auth/ForgotPassword';
// import Footer from './components/layout/Footer';

// Create a new component that will live inside AuthProvider to access auth context
function AppContent() {
  const { currentUser, loading } = useAuth(); // Now, useAuth() is called within the AuthProvider's context

  // Handle loading state for authentication
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading authentication...
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar /> {/* Navbar might also need currentUser info, so it's good here */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Private Routes - They already use PrivateRoute which handles currentUser */}
        {/* BUT for components that *directly* consume currentUser (like Activities below),
            ensure currentUser is valid before passing uid */}

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/sentimental-analysis" element={
          <PrivateRoute>
            <SentimentalAnalysis />
          </PrivateRoute>
        } />

        {/* YOUR ADDED ROUTES */}
        {/* Pass userId to Activities only if currentUser exists */}
        <Route path="/activities" element={
          <PrivateRoute>
            {currentUser ? <Activities userId={currentUser.uid} /> : null} 
            {/* If currentUser is null here, it means PrivateRoute didn't block it, 
                which indicates a potential logic flaw or a loading state issue.
                The 'loading' check above helps prevent this. */}
          </PrivateRoute>
        } />

        <Route path="/sleep-tracker" element={
          <PrivateRoute>
            {currentUser ? <SleepTracker userId={currentUser.uid} /> : null}
          </PrivateRoute>
        } />

        <Route path="/exercise-tracker" element={
          <PrivateRoute>
            {currentUser ? <ExerciseTracker userId={currentUser.uid} /> : null}
          </PrivateRoute>
        } />

        <Route path="/games" element={
          <PrivateRoute>
            <Games />
          </PrivateRoute>
        } />
        
        {/* PARTNER'S NEW CBT JOURNAL ROUTES (Replaced old /chat route) */}
        <Route path="/cbt-journal" element={
          <PrivateRoute>
            <CBTJournalList />
          </PrivateRoute>
        } />
        
        <Route path="/cbt-journal/new" element={
          <PrivateRoute>
            <CBTJournalEntryForm />
          </PrivateRoute>
        } />
        
        <Route path="/cbt-journal/view/:id" element={
          <PrivateRoute>
            <CBTJournalEntryDetail />
          </PrivateRoute>
        } />
        
        {/* <Route path="/forgot-password" element={
          <PrivateRoute>
            <ForgotPassword />
          </PrivateRoute>
        } /> */}
        
        <Route path="/color-psychology" element={
          <PrivateRoute>
            <ColorPsychology />
          </PrivateRoute>
        } />
        
        <Route path="/final-result" element={
          <PrivateRoute>
            <FinalResult />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/mentalhaccess" element={
          <PrivateRoute>
            <MentalHealthResourcesPage />
          </PrivateRoute>
        } />

        {/* Optional: Your previously commented music route */}
        <Route path="/calm" element={
          <PrivateRoute>
            <CalmZone/>
          </PrivateRoute>
        } />
      </Routes>
      {/* <Footer /> */} {/* Partner's commented footer */}
    </div>
  );
}

// The main App component now only sets up the AuthProvider and Router
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* AppContent now lives inside AuthProvider */}
        <AppContent /> 
      </Router>
    </AuthProvider>
  );
}

export default App;
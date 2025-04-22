import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './components/Homepage';
import QuizGenerator from './components/QuizGenerator';
import Notes from './components/Notes';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Homepage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz-generator" 
            element={
              <PrivateRoute>
                <QuizGenerator />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/notes" 
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

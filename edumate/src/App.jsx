import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Homepage from './components/Homepage';
import QuizGenerator from './components/QuizGenerator';
import Notes from './components/Notes';
import Onboarding from './components/Onboarding';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';

const OnboardingCheck = ({ children }) => {
  const { user } = useAuth();
  
  if (!user?.onboardingCompleted) {
    return <Navigate to="/onboarding" />;
  }
  
  return children;
};

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
                <OnboardingCheck>
                  <Homepage />
                </OnboardingCheck>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz-generator" 
            element={
              <PrivateRoute>
                <OnboardingCheck>
                  <QuizGenerator />
                </OnboardingCheck>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/notes" 
            element={
              <PrivateRoute>
                <OnboardingCheck>
                  <Notes />
                </OnboardingCheck>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <PrivateRoute>
                <Onboarding />
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

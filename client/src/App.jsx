import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Homepage from './components/Homepage';
import Notes from './components/Notes';
import QuizGenerator from './components/QuizGenerator';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const InProgress = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon!</h1>
        <p className="text-xl text-gray-600">This feature is currently in development.</p>
      </div>
    </div>
  );
};

const ExternalPage = ({ url }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <iframe 
          src={url} 
          className="w-full h-full min-h-[calc(100vh-160px)]" 
          style={{ border: 'none' }}
          title="External Content"
        />
      </div>
      <Footer />
    </div>
  );
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Layout><Homepage /></Layout>} />
          <Route path="/notes" element={<Layout><Notes /></Layout>} />
          <Route path="/quiz-generator" element={<Layout><QuizGenerator /></Layout>} />
          <Route path="/ai-buddy" element={<Layout><InProgress /></Layout>} />
          <Route path="/planner" element={<ExternalPage url="https://edu-mate-4.vercel.app" />} />
          <Route path="/insights" element={<ExternalPage url="https://edu-mate5.vercel.app" />} />
          <Route path="/teachers" element={<ExternalPage url="https://edu-mate6.vercel.app" />} />
          <Route path="/institutes" element={<ExternalPage url="https://edu-mate7.vercel.app" />} />
          <Route path="/connect" element={<ExternalPage url="https://edu-mate9.vercel.app" />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

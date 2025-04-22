import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GraphSection from './GraphSection';

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#3a8dff] to-[#a182ff] py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Unlock Smarter Learning, Faster 🚀
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in-up">
              Let AI organize your notes, quizzes, and insights — so you focus on learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <button 
                className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#4facfe]/30 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </button>
              <button 
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                onClick={() => navigate('/features')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Modern Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Notes</h3>
              <p className="text-gray-600">AI-powered note-taking that highlights key concepts and organizes your study materials.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quizzes</h3>
              <p className="text-gray-600">Automatically generate practice quizzes from your study materials to test your knowledge.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Insights</h3>
              <p className="text-gray-600">Track your learning progress and get personalized insights to improve your study habits.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <GraphSection />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#3a8dff] to-[#a182ff] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using EduMate to enhance their learning experience.
          </p>
          <button 
            className="bg-white text-[#3a8dff] px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-white/30 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate('/signup')}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage; 
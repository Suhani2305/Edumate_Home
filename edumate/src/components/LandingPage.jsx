import { useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const modules = [
    {
      title: 'User Management',
      icon: '👤',
      description: 'Seamless user profiles and role-based access'
    },
    {
      title: 'Smart Notes',
      icon: '📝',
      description: 'AI-powered summarization and organization'
    },
    {
      title: 'Quiz & Flashcards',
      icon: '🎯',
      description: 'Automated quiz and flashcard generation'
    },
    {
      title: 'AI Study Planner',
      icon: '📅',
      description: 'Personalized study schedules and goals'
    },
    {
      title: 'Learning Analytics',
      icon: '📊',
      description: 'Detailed performance tracking and insights'
    },
    {
      title: 'Teacher Dashboard',
      icon: '👨‍🏫',
      description: 'Comprehensive teaching tools and analytics'
    },
    {
      title: 'Institution Tools',
      icon: '🏫',
      description: 'School-wide reporting and management'
    },
    {
      title: 'AI Chat Assistant',
      icon: '🤖',
      description: '24/7 learning support and guidance'
    },
    {
      title: 'Integrations',
      icon: '🔌',
      description: 'Seamless cross-platform connectivity'
    },
    {
      title: 'Data Security',
      icon: '🔒',
      description: 'Enterprise-grade security and privacy'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'University Student',
      text: 'EduMate has transformed how I study. The AI-powered notes and quizzes are incredibly helpful!',
      image: '/testimonial1.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'High School Teacher',
      text: 'The teacher dashboard gives me insights I never had before. It\'s a game-changer for education.',
      image: '/testimonial2.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-edublue">EduMate</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-edublue">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-edublue">Testimonials</a>
              <Link to="/login" className="bg-edublue text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Login
              </Link>
              <Link to="/signup" className="bg-accent text-darknavy px-4 py-2 rounded-md hover:bg-yellow-400">
                Sign Up
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-darknavy mb-6">
            Revolutionize Your Study Experience with EduMate
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered learning companion for Students, Teachers, and Institutions.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup" className="bg-edublue text-white px-6 py-3 rounded-md hover:bg-blue-600 text-lg">
              Get Started
            </Link>
            <a href="#features" className="bg-white text-edublue border border-edublue px-6 py-3 rounded-md hover:bg-gray-50 text-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-darknavy mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-semibold text-darknavy mb-2">{module.title}</h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Visualization Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-darknavy">How EduMate Works</h2>
            <p className="text-gray-600 mt-4">Our AI technology makes learning smarter and more efficient</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">Input</h3>
                <p className="text-gray-600">Upload your study materials</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">Process</h3>
                <p className="text-gray-600">AI analyzes and organizes content</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Output</h3>
                <p className="text-gray-600">Get personalized learning tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-darknavy mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-semibold text-darknavy">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darknavy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EduMate</h3>
              <p className="text-gray-400">AI-powered learning companion for modern education.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 EduMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage; 
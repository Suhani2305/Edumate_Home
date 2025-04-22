import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">EduMate</h3>
            <p className="text-gray-400">Your all-in-one educational platform for smarter learning.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><Link to="/notes" className="text-gray-400 hover:text-white transition-colors">Notes</Link></li>
              <li><Link to="/quiz-generator" className="text-gray-400 hover:text-white transition-colors">Quiz Generator</Link></li>
              <li><Link to="/ai-buddy" className="text-gray-400 hover:text-white transition-colors">AI Buddy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/planner" className="text-gray-400 hover:text-white transition-colors">Planner</Link></li>
              <li><Link to="/insights" className="text-gray-400 hover:text-white transition-colors">Insights</Link></li>
              <li><Link to="/teachers" className="text-gray-400 hover:text-white transition-colors">Teachers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><Link to="/institutes" className="text-gray-400 hover:text-white transition-colors">Institutes</Link></li>
              <li><Link to="/connect" className="text-gray-400 hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2024 EduMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
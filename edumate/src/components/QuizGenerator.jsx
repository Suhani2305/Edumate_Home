import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const QuizGenerator = () => {
  const [notes, setNotes] = useState('');
  const [quizType, setQuizType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('basic');
  const [subject, setSubject] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleGenerateQuiz = async () => {
    setError(null);
    setIsGenerating(true);
    setGeneratedQuestions(null);
    setUserAnswers({});
    setShowResults({});
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          quizType,
          difficulty,
          subject,
          numQuestions
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedQuestions(data.questions);
      } else {
        setError(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      setError('Error connecting to server. Please try again.');
      console.error('Error generating quiz:', error);
    }
    setIsGenerating(false);
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('http://localhost:5000/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: generatedQuestions,
          type: quizType,
          subject,
          difficulty,
          userAnswers,
          score: calculateScore()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subject}_quiz.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Error exporting to PDF');
      console.error('Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    if (quizType !== 'fill') {
      setShowResults(prev => ({
        ...prev,
        [questionIndex]: true
      }));
    }
  };

  const handleSubmitAnswer = (questionIndex) => {
    setShowResults(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!generatedQuestions || !Array.isArray(generatedQuestions)) return 0;
    let correct = 0;
    generatedQuestions.forEach((q, index) => {
      if (quizType === 'mcq' && userAnswers[index] === q.correct) {
        correct++;
      } else if (quizType === 'truefalse' && userAnswers[index] === q.isTrue) {
        correct++;
      } else if (quizType === 'fill' && userAnswers[index] === q.answer) {
        correct++;
      }
    });
    return (correct / generatedQuestions.length) * 100;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('http://localhost:5000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      setNotes(data.text);
    } catch (error) {
      setError('Error uploading PDF: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const renderQuestion = (question, index) => {
    if (!question) return null;

    switch (quizType) {
      case 'mcq':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{index + 1}. {question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => {
                const isCorrect = option === question.correct;
                const isSelected = userAnswers[index] === option;
                const showAnswer = showResults[index];
                
                return (
                  <label 
                    key={optIndex} 
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                      showAnswer
                        ? isCorrect
                          ? 'bg-green-50 border border-green-200' 
                          : isSelected
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-white border border-gray-200'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(index, option)}
                      className="h-4 w-4 text-[#3F8CFF] focus:ring-[#3F8CFF]"
                      disabled={showAnswer}
                    />
                    <span className={`flex-grow ${showAnswer && isCorrect ? 'font-medium' : ''}`}>
                      {option}
                    </span>
                    {showAnswer && (
                      <span className={`ml-2 flex items-center ${
                        isCorrect ? 'text-green-500' : isSelected ? 'text-red-500' : ''
                      }`}>
                        {isCorrect && <span>✓ Correct</span>}
                        {!isCorrect && isSelected && <span>✗ Incorrect</span>}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {showResults[index] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'fill':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{index + 1}. {question.question}</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={userAnswers[index] || ''}
                onChange={(e) => handleAnswerSelect(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F8CFF]"
                placeholder="Type your answer..."
                disabled={showResults[index]}
              />
              {!showResults[index] && (
                <button
                  onClick={() => handleSubmitAnswer(index)}
                  className="bg-[#3F8CFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3578E5] transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
            {showResults[index] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your answer:</span> {userAnswers[index] || 'Not answered'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Correct answer:</span> {question.answer}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'truefalse':
        return (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{index + 1}. {question.statement}</h3>
            <div className="space-x-4">
              {['True', 'False'].map((option) => (
                <label 
                  key={option} 
                  className={`inline-flex items-center space-x-2 p-3 rounded-lg cursor-pointer ${
                    showResults[index] 
                      ? (option === 'True' ? question.isTrue : !question.isTrue)
                        ? 'bg-green-50 border border-green-200' 
                        : userAnswers[index] === (option === 'True')
                          ? 'bg-red-50 border border-red-200'
                          : 'hover:bg-gray-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={userAnswers[index] === (option === 'True')}
                    onChange={() => handleAnswerSelect(index, option === 'True')}
                    className="h-4 w-4 text-[#3F8CFF] focus:ring-[#3F8CFF]"
                    disabled={showResults[index]}
                  />
                  <span className="text-gray-700">{option}</span>
                  {showResults[index] && (
                    <>
                      {(option === 'True' ? question.isTrue : !question.isTrue) && (
                        <span className="ml-2 text-green-500">✓ Correct Answer</span>
                      )}
                      {userAnswers[index] === (option === 'True') && 
                       (option === 'True' ? !question.isTrue : question.isTrue) && (
                        <span className="ml-2 text-red-500">✗ Your Answer</span>
                      )}
                    </>
                  )}
                </label>
              ))}
            </div>
            {showResults[index] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your answer:</span> {userAnswers[index] ? 'True' : 'False'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Correct answer:</span> {question.isTrue ? 'True' : 'False'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case 'flashcard':
        return (
          <div className="mb-6">
            <div 
              className="p-6 bg-white rounded-lg shadow-md cursor-pointer min-h-[200px] flex items-center justify-center text-center"
              onClick={() => handleAnswerSelect(index, !userAnswers[index])}
            >
              <div>
                {!userAnswers[index] ? (
                  <>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{question.front}</h3>
                    <p className="text-sm text-gray-500">Click to flip</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium text-gray-900 mb-4">{question.back}</h3>
                    {question.hint && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Hint:</span> {question.hint}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-gradient-to-r from-[#3a8dff] to-[#a182ff] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">Quiz Generator</h1>
          <p className="text-white/90 text-center mb-8">Transform your study material into interactive quizzes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Generation Form */}
        {!generatedQuestions && (
          <>
            <div className="mb-6">
              <label className="block text-[#141D2B] font-medium mb-2">Your Notes</label>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {isUploading ? 'Uploading...' : 'Upload PDF'}
                  </label>
                  {isUploading && (
                    <div className="text-sm text-gray-500">Extracting text from PDF...</div>
                  )}
                </div>
                <textarea
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F8CFF] focus:border-transparent"
                  placeholder="Paste your study material here or upload a PDF..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-[#141D2B] font-medium mb-2">Quiz Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F8CFF]"
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="fill">Fill in the Blanks</option>
                  <option value="truefalse">True/False</option>
                  <option value="flashcard">Flashcards</option>
                </select>
              </div>

              <div>
                <label className="block text-[#141D2B] font-medium mb-2">Difficulty</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F8CFF]"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[#141D2B] font-medium mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F8CFF]"
                  placeholder="e.g., Mathematics, History"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[#141D2B] font-medium mb-2">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F8CFF]"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !notes.trim()}
                className="bg-[#3F8CFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3578E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
          </>
        )}

        {/* Generated Quiz */}
        {generatedQuestions && Array.isArray(generatedQuestions) && (
          <div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {activeQuestion + 1} of {generatedQuestions.length}</span>
                {showResults && <span>Score: {calculateScore().toFixed(1)}%</span>}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-[#3F8CFF] rounded-full transition-all"
                  style={{ width: `${((activeQuestion + 1) / generatedQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Questions */}
            {renderQuestion(generatedQuestions[activeQuestion], activeQuestion)}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                disabled={activeQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                Previous
              </button>
              
              {activeQuestion === generatedQuestions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={showResults}
                  className="bg-[#3F8CFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#3578E5] transition-colors disabled:opacity-50"
                >
                  {showResults ? 'Quiz Completed' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveQuestion(prev => Math.min(generatedQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Next
                </button>
              )}
            </div>

            {/* Export Options */}
            {showResults && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-[#FCD34D] text-[#141D2B] px-6 py-2.5 rounded-lg font-medium hover:bg-[#FBBF24] transition-colors shadow-md flex items-center space-x-2"
                >
                  {isExporting ? (
                    <span>Exporting...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Export to PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setGeneratedQuestions(null);
                    setNotes('');
                    setUserAnswers({});
                    setShowResults({});
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-md flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Create New Quiz</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Raw Text Display (if not JSON) */}
        {generatedQuestions && !Array.isArray(generatedQuestions) && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-[#141D2B] mb-4">Generated Questions</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{generatedQuestions}</pre>
            </div>
            <button
              onClick={() => setGeneratedQuestions(null)}
              className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator; 
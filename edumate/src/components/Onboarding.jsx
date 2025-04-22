import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    class: '',
    subjects: [],
    interests: [],
    goals: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    {
      title: 'Class Information',
      description: 'Tell us about your current academic level',
      fields: ['class']
    },
    {
      title: 'Subjects',
      description: 'What subjects are you studying?',
      fields: ['subjects']
    },
    {
      title: 'Interests',
      description: 'What topics interest you the most?',
      fields: ['interests']
    },
    {
      title: 'Goals',
      description: 'What do you want to achieve?',
      fields: ['goals']
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInput = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...new Set([...prev[field], value.trim()])]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboarding(formData);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const field = step.fields[0];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
          <p className="mt-2 text-gray-600">{step.description}</p>
        </div>

        {field === 'class' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Class/Grade</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 10th Grade, First Year College"
            />
          </div>
        )}

        {(field === 'subjects' || field === 'interests' || field === 'goals') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Add {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInput(field, e.target.value);
                    e.target.value = '';
                  }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Type and press Enter to add ${field}`}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {formData[field].map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeArrayItem(field, index)}
                    className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 ${
                  index < steps.length - 1 ? 'border-b-2' : ''
                } ${
                  index <= currentStep ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  } h-8 w-8 text-white`}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white px-8 py-12 shadow rounded-lg">
          {renderStep()}

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={loading}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? (
                loading ? 'Saving...' : 'Complete Setup'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 
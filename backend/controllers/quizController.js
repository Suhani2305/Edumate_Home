const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const generateQuiz = async (req, res) => {
  try {
    const { notes, quizType, difficulty, subject, numQuestions = 5 } = req.body;

    if (!notes || !quizType || !difficulty || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Construct the prompt based on quiz type and difficulty
    let prompt = `You are an expert educational quiz generator. Create ${difficulty} level questions for ${subject} based on the given content. Format the response as a JSON array.\n\n`;
    prompt += `Generate ${numQuestions} ${quizType} questions from this content:\n\n${notes}\n\n`;
    
    switch (quizType) {
      case 'mcq':
        prompt += 'Format each question as: {"question": "...", "options": ["option1", "option2", "option3", "option4"], "correct": "exact_correct_option_text", "explanation": "..."}. Make sure the "correct" field contains the exact text of the correct option, not just a letter.';
        break;
      case 'fill':
        prompt += 'Format each question as: {"question": "... ___ ...", "answer": "correct word", "explanation": "..."}';
        break;
      case 'truefalse':
        prompt += 'Format each question as: {"statement": "...", "isTrue": boolean, "explanation": "..."}';
        break;
      case 'flashcard':
        prompt += 'Format each card as: {"front": "...", "back": "...", "hint": "..."}';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid quiz type'
        });
    }

    // Call Gemini API
    const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyBfdPXxvX6EPEBdynqJZONafpoHW8RcJoQ';
    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
    
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No response generated from the API');
    }

    let questions = [];
    try {
      // Try to parse the response as JSON
      const responseText = data.candidates[0].content.parts[0].text;
      // Find JSON array in the response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array found, try to parse the entire response
        questions = JSON.parse(responseText);
      }

      // Validate questions format
      if (!Array.isArray(questions)) {
        throw new Error('Invalid response format');
      }

      // Ensure each question has the required fields
      questions = questions.map((q, index) => {
        switch (quizType) {
          case 'mcq':
            if (!q.question || !Array.isArray(q.options) || !q.correct || !q.explanation) {
              throw new Error(`Invalid MCQ format for question ${index + 1}`);
            }
            break;
          case 'fill':
            if (!q.question || !q.answer || !q.explanation) {
              throw new Error(`Invalid fill-in-the-blank format for question ${index + 1}`);
            }
            break;
          case 'truefalse':
            if (!q.statement || typeof q.isTrue !== 'boolean' || !q.explanation) {
              throw new Error(`Invalid true/false format for question ${index + 1}`);
            }
            break;
          case 'flashcard':
            if (!q.front || !q.back) {
              throw new Error(`Invalid flashcard format for question ${index + 1}`);
            }
            break;
        }
        return q;
      });

      // Ensure we have the requested number of questions
      if (questions.length < numQuestions) {
        throw new Error(`Could only generate ${questions.length} questions instead of the requested ${numQuestions}`);
      }

      // Trim to requested number if we got more
      questions = questions.slice(0, numQuestions);

    } catch (e) {
      console.error('Error parsing response:', e);
      // If parsing fails, return the raw text for debugging
      return res.status(500).json({
        success: false,
        error: 'Failed to parse quiz questions',
        debug: {
          rawResponse: data.candidates[0].content.parts[0].text,
          parseError: e.message
        }
      });
    }

    res.json({
      success: true,
      questions,
      type: quizType,
      difficulty,
      subject
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz'
    });
  }
};

module.exports = {
  generateQuiz
}; 
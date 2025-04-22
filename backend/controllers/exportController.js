const PDFDocument = require('pdfkit');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

// Google Forms setup
const forms = google.forms({
  version: 'v1',
  auth: process.env.GOOGLE_API_KEY
});

const exportToPDF = async (req, res) => {
  try {
    const { questions, type, subject, difficulty, userAnswers, score } = req.body;

    // Input validation
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty questions array'
      });
    }

    if (!type || !['mcq', 'fill', 'truefalse', 'flashcard'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz type'
      });
    }

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Subject is required'
      });
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${subject}_quiz.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add header
    doc
      .fontSize(24)
      .text(`${subject} Quiz`, { align: 'center' })
      .moveDown()
      .fontSize(14)
      .text(`Difficulty: ${difficulty}`, { align: 'center' })
      .text(`Type: ${type.toUpperCase()}`, { align: 'center' })
      .moveDown();

    if (score !== undefined) {
      doc
        .fontSize(16)
        .text(`Score: ${score.toFixed(1)}%`, { align: 'center' })
        .moveDown();
    }

    // Add questions
    questions.forEach((q, index) => {
      doc.moveDown().fontSize(14);

      // Safely get user answer
      const userAnswer = userAnswers ? userAnswers[index] : undefined;

      switch (type) {
        case 'mcq':
          doc
            .text(`${index + 1}. ${q.question}`)
            .moveDown(0.5);
          
          q.options.forEach((option, optIndex) => {
            const isCorrect = optIndex === q.correctIndex;
            const isUserAnswer = option === userAnswer;
            let marker = '○';
            if (score !== undefined) {
              if (isCorrect) marker = '✓';
              else if (isUserAnswer) marker = '×';
            }
            doc.text(`${marker} ${option}`);
          });

          if (score !== undefined) {
            doc
              .moveDown(0.5)
              .fontSize(12)
              .text(`Explanation: ${q.explanation}`, { color: 'gray' });
          }
          break;

        case 'fill':
          doc
            .text(`${index + 1}. ${q.question}`)
            .moveDown(0.5);

          if (score !== undefined) {
            doc
              .text(`Your answer: ${userAnswer || 'Not answered'}`)
              .text(`Correct answer: ${q.answer}`)
              .moveDown(0.5)
              .fontSize(12)
              .text(`Explanation: ${q.explanation}`, { color: 'gray' });
          }
          break;

        case 'truefalse':
          doc
            .text(`${index + 1}. ${q.statement}`)
            .moveDown(0.5);

          if (score !== undefined) {
            doc
              .text(`Your answer: ${userAnswer ? 'True' : 'False'}`)
              .text(`Correct answer: ${q.isTrue ? 'True' : 'False'}`)
              .moveDown(0.5)
              .fontSize(12)
              .text(`Explanation: ${q.explanation}`, { color: 'gray' });
          }
          break;

        case 'flashcard':
          doc
            .text(`${index + 1}. Front: ${q.front}`)
            .moveDown(0.5)
            .text(`Back: ${q.back}`);

          if (q.hint) {
            doc
              .moveDown(0.5)
              .fontSize(12)
              .text(`Hint: ${q.hint}`, { color: 'gray' });
          }
          break;
      }

      doc.moveDown();
    });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF'
    });
  }
};

const exportToGoogleForms = async (req, res) => {
  try {
    const { questions, title } = req.body;
    
    const form = {
      info: {
        title: title || 'Quiz',
        documentTitle: title || 'Quiz'
      },
      items: questions.map(question => ({
        title: question.text,
        questionItem: {
          question: {
            choiceQuestion: {
              type: 'RADIO',
              options: question.options.map(option => ({ value: option })),
              shuffle: true
            }
          }
        }
      }))
    };

    const response = await forms.forms.create({
      requestBody: form,
      key: process.env.GOOGLE_API_KEY
    });

    res.json({ formUrl: response.data.responderUri });
  } catch (error) {
    console.error('Error creating Google Form:', error);
    res.status(500).json({ error: 'Failed to create Google Form' });
  }
};

const exportToMoodle = async (req, res) => {
  try {
    const { questions, title } = req.body;
    
    // Generate Moodle XML format manually
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<quiz>\n';
    
    questions.forEach((question, index) => {
      xml += '  <question type="multichoice">\n';
      xml += `    <name><text>${title || 'Quiz'} - Question ${index + 1}</text></name>\n`;
      xml += `    <questiontext format="html"><text>${question.text}</text></questiontext>\n`;
      xml += '    <defaultgrade>1.0</defaultgrade>\n';
      xml += '    <shuffleanswers>true</shuffleanswers>\n';
      xml += '    <answernumbering>abc</answernumbering>\n';
      
      if (question.options) {
        question.options.forEach((option, optIndex) => {
          xml += '    <answer fraction="' + (optIndex === question.correctIndex ? '100' : '0') + '">\n';
          xml += `      <text>${option}</text>\n`;
          xml += '    </answer>\n';
        });
      }
      
      xml += '  </question>\n';
    });
    
    xml += '</quiz>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=${title || 'quiz'}.xml`);
    res.send(xml);
  } catch (error) {
    console.error('Error generating Moodle XML:', error);
    res.status(500).json({ error: 'Failed to generate Moodle XML' });
  }
};

module.exports = {
  exportToPDF,
  exportToGoogleForms,
  exportToMoodle
}; 
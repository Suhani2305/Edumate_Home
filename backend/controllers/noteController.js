const Note = require('../models/Note');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const mammoth = require('mammoth');
const unzipper = require('unzipper');
const xml2js = require('xml2js');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

// Configure Gemini API
const generateGeminiResponse = async (prompt) => {
  try {
    const response = await fetch(`${process.env.GOOGLE_AI_ENDPOINT}?key=${process.env.GOOGLE_AI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper function to extract text from PPTX
const extractTextFromPPTX = async (filePath) => {
  const parser = new xml2js.Parser();
  let textContent = '';

  try {
    const directory = await unzipper.Open.file(filePath);
    const slides = directory.files.filter(f => f.path.startsWith('ppt/slides/slide'));
    
    for (const slide of slides) {
      const buffer = await slide.buffer();
      const result = await parser.parseStringPromise(buffer.toString());
      textContent += extractTextFromSlide(result) + '\n\n';
    }
  } catch (error) {
    console.error('Error extracting text from PPTX:', error);
  }

  return textContent;
};

const extractTextFromSlide = (slideData) => {
  const extractText = (obj) => {
    if (typeof obj === 'string') return obj;
    if (Array.isArray(obj)) return obj.map(extractText).join(' ');
    if (typeof obj === 'object') {
      return Object.values(obj).map(extractText).join(' ');
    }
    return '';
  };
  return extractText(slideData);
};

// Helper function to transcribe audio
const transcribeAudio = async (filePath) => {
  // Convert audio to WAV format if needed
  const wavPath = filePath.replace(/\.[^/.]+$/, '.wav');
  if (path.extname(filePath) !== '.wav') {
    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .toFormat('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(wavPath);
    });
  }

  // Here you would integrate with Whisper API or another transcription service
  // For now, we'll use a placeholder
  return "Audio transcription placeholder";
};

// Process uploaded file
const processFile = async (req, res) => {
  try {
    const { file } = req;
    const userId = req.user._id;
    const { title, category, tags } = req.body;
    const fileType = path.extname(file.originalname).slice(1).toLowerCase();
    const startTime = Date.now();

    // Process file content based on type
    let content = '';
    let note;
    try {
      switch (fileType) {
        case 'pdf':
          const pdfData = await pdfParse(fs.readFileSync(file.path));
          content = pdfData.text;
          break;

        case 'docx':
          const docxResult = await mammoth.extractRawText({ path: file.path });
          content = docxResult.value;
          break;

        case 'ppt':
        case 'pptx':
          content = await extractTextFromPPTX(file.path);
          break;

        case 'jpg':
        case 'jpeg':
        case 'png':
          const worker = await createWorker();
          const { data: { text } } = await worker.recognize(file.path);
          await worker.terminate();
          content = text;
          break;

        case 'mp3':
        case 'mp4':
        case 'wav':
          content = await transcribeAudio(file.path);
          break;

        default:
          if (!['txt'].includes(fileType)) {
            throw new Error('Unsupported file type');
          }
          content = fs.readFileSync(file.path, 'utf8');
      }

      // Create note with extracted content
      note = new Note({
        user: userId,
        title: title || file.originalname,
        fileType,
        fileUrl: file.path,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category: category || 'other',
        processingStatus: 'processing',
        originalContent: content || 'No content could be extracted',
        transcription: fileType.match(/^(mp3|mp4|wav)$/) ? content : ''
      });

      await note.save();

      // Generate AI enhancements using Gemini
      const summaryPrompt = `Create a comprehensive and well-structured summary of this educational content. Follow this format:

# Main Topic Title

## Overview
[Brief overview paragraph of the entire content]

## Key Points
* [Key point 1]
* [Key point 2]
* [Key point 3]
...

## Detailed Summary
### Section 1: [Section Title]
[Detailed explanation with important concepts and examples]

### Section 2: [Section Title]
[Detailed explanation with important concepts and examples]
...

## Important Concepts
* **[Concept 1]**: [Brief explanation]
* **[Concept 2]**: [Brief explanation]
...

## Practical Applications
* [Application 1]
* [Application 2]
...

Content to summarize:
${content}`;

      note.summary = await generateGeminiResponse(summaryPrompt);

      const conceptsPrompt = `Analyze this educational content and extract key concepts. For each concept:
1. Identify the concept name
2. Rate its importance (1-5, where 5 is most important)
3. Provide a detailed description
4. Include relevant examples or applications
5. Note any prerequisites or related concepts

Format as JSON array:
[{
  "concept": "concept name",
  "importance": importance_number,
  "description": "detailed description",
  "examples": ["example 1", "example 2"],
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "relatedConcepts": ["related concept 1", "related concept 2"]
}]

Content to analyze:
${content}`;

      const conceptsResponse = await generateGeminiResponse(conceptsPrompt);
      if (conceptsResponse) {
        try {
          note.keyConcepts = JSON.parse(conceptsResponse);
        } catch (error) {
          console.error('Error parsing concepts:', error);
        }
      }

      const mindMapPrompt = `Create a visually structured mind map for this educational content. The mind map should be hierarchical and comprehensive.

1. Structure:
   - Start with ONE central topic that summarizes the main subject
   - Create 3-5 main branches for key themes/topics
   - Add 2-4 sub-branches under each main branch
   - Include relevant examples, applications, or details as leaf nodes
   - Add cross-connections between related concepts

2. For each node, provide:
   - Clear, concise label
   - Brief description (1-2 sentences)
   - Importance level (1-5)
   - Proper categorization (concept/example/application/definition)

3. For each connection, specify:
   - Clear relationship type (e.g., "defines", "leads to", "example of")
   - Brief description of how they're related

Format the response as a JSON object with this EXACT structure:
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "concise name",
      "description": "1-2 sentence description",
      "category": "concept/example/application/definition",
      "level": "central/main/sub/leaf",
      "importance": 1-5
    }
  ],
  "edges": [
    {
      "source": "parent_node_id",
      "target": "child_node_id",
      "relationship": "defines/contains/leads_to/example_of/related_to",
      "description": "brief description of relationship"
    }
  ],
  "layout": {
    "central": ["id_of_central_node"],
    "main_branches": ["ids_of_main_topic_nodes"],
    "sub_branches": ["ids_of_subtopic_nodes"]
  }
}

Make sure to:
1. Use descriptive IDs (e.g., "algorithms_intro", "sorting_types")
2. Create a balanced structure with good visual hierarchy
3. Include practical examples and applications
4. Add meaningful cross-connections between branches
5. Keep labels concise but descriptive

Content to analyze:
${content}`;

      const mindMapResponse = await generateGeminiResponse(mindMapPrompt);
      if (mindMapResponse) {
        try {
          const mindMapData = JSON.parse(mindMapResponse);
          
          // Add visual styling information
          mindMapData.styles = {
            central: {
              backgroundColor: "#3a8dff",
              textColor: "#ffffff",
              borderColor: "#2970ff",
              fontSize: "20px"
            },
            main: {
              backgroundColor: "#a182ff",
              textColor: "#ffffff",
              borderColor: "#8b5cf6",
              fontSize: "18px"
            },
            sub: {
              backgroundColor: "#f8fafc",
              textColor: "#1e293b",
              borderColor: "#e2e8f0",
              fontSize: "16px"
            },
            leaf: {
              backgroundColor: "#ffffff",
              textColor: "#475569",
              borderColor: "#cbd5e1",
              fontSize: "14px"
            }
          };

          // Add visual layout hints
          mindMapData.layout = {
            ...mindMapData.layout,
            spacing: {
              vertical: 40,
              horizontal: 60
            },
            direction: "vertical"
          };
          
          note.mindMap = mindMapData;
        } catch (error) {
          console.error('Error parsing mind map:', error);
        }
      }

      // Update note with processed content and metadata
      note.isProcessed = true;
      note.processingStatus = 'completed';
      note.aiMetadata = {
        model: 'gemini-1.5-pro',
        confidence: 0.95,
        processingTime: Date.now() - startTime
      };

      await note.save();

      res.json({
        success: true,
        note: note.getPublicFields()
      });
    } catch (error) {
      // If note was created, update its status to failed
      if (note) {
        note.processingStatus = 'failed';
        await note.save();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all notes for a user with filters
const getNotes = async (req, res) => {
  try {
    const { category, tags, search } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .select('-originalContent');

    res.json({
      success: true,
      notes: notes.map(note => note.getPublicFields())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a specific note
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    res.json({
      success: true,
      note: note.getPublicFields()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Delete associated file if exists
    if (note.fileUrl && fs.existsSync(note.fileUrl)) {
      fs.unlinkSync(note.fileUrl);
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const note = await Note.findOne({ _id: id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'category', 'tags', 'isPublic'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === 'tags' && typeof updates[key] === 'string') {
          note[key] = updates[key].split(',').map(tag => tag.trim());
        } else {
          note[key] = updates[key];
        }
      }
    });

    note.lastModified = Date.now();
    await note.save();

    res.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

const updateCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permissions } = req.body;
    
    const note = await Note.findOne({ _id: id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Add or update collaborator
    const collaboratorIndex = note.collaborators.findIndex(c => c.email === email);
    if (collaboratorIndex >= 0) {
      note.collaborators[collaboratorIndex].permissions = permissions;
    } else {
      note.collaborators.push({ email, permissions });
    }

    await note.save();
    res.json({ note: note.getPublicFields() });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    res.status(500).json({ error: 'Failed to update collaborator' });
  }
};

const removeCollaborator = async (req, res) => {
  try {
    const { id, collaboratorId } = req.params;
    
    const note = await Note.findOne({ _id: id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.collaborators = note.collaborators.filter(c => c._id.toString() !== collaboratorId);
    await note.save();
    
    res.json({ note: note.getPublicFields() });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
};

module.exports = {
  upload,
  processFile,
  getNotes,
  getNote,
  updateNote,
  updateCollaborator,
  removeCollaborator,
  deleteNote
}; 
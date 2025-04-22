const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  upload,
  processFile,
  getNotes,
  getNote,
  updateNote,
  updateCollaborator,
  removeCollaborator,
  deleteNote
} = require('../controllers/noteController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Notes route is working!' });
});

// Get all notes (with filters)
router.get('/', auth, getNotes);

// Get a specific note
router.get('/:id', auth, getNote);

// Create a new note from file
router.post('/upload', auth, upload.single('file'), processFile);

// Update note
router.put('/:id', auth, updateNote);

// Manage collaborators
router.post('/:id/collaborators', auth, updateCollaborator);
router.delete('/:id/collaborators/:collaboratorId', auth, removeCollaborator);

// Delete note
router.delete('/:id', auth, deleteNote);

module.exports = router; 
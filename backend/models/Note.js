const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  originalContent: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  keyConcepts: [{
    concept: String,
    importance: Number,
    description: String
  }],
  mindMap: {
    nodes: [{
      id: String,
      label: String,
      category: String
    }],
    edges: [{
      source: String,
      target: String,
      relationship: String
    }]
  },
  fileType: {
    type: String,
    enum: ['txt', 'pdf', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'mp3', 'mp4', 'wav'],
    required: true
  },
  fileUrl: String,
  transcription: {
    type: String,
    default: ''
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  tags: [String],
  category: {
    type: String,
    enum: ['lecture', 'assignment', 'study', 'research', 'other'],
    default: 'other'
  },
  collaborators: [{
    email: {
      type: String,
      required: true
    },
    permissions: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiMetadata: {
    model: String,
    confidence: Number,
    processingTime: Number
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add text index for search functionality
noteSchema.index({ 
  title: 'text', 
  originalContent: 'text', 
  summary: 'text',
  transcription: 'text',
  'keyConcepts.concept': 'text'
});

// Method to get public fields
noteSchema.methods.getPublicFields = function() {
  return {
    id: this._id,
    title: this.title,
    summary: this.summary,
    keyConcepts: this.keyConcepts,
    mindMap: this.mindMap,
    fileType: this.fileType,
    fileUrl: this.fileUrl,
    transcription: this.transcription,
    isProcessed: this.isProcessed,
    processingStatus: this.processingStatus,
    tags: this.tags,
    category: this.category,
    collaborators: this.collaborators,
    createdAt: this.createdAt,
    lastModified: this.lastModified
  };
};

module.exports = mongoose.model('Note', noteSchema); 
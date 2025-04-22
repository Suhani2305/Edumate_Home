import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import Navbar from './Navbar';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const Notes = () => {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showMindMap, setShowMindMap] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadDetails, setUploadDetails] = useState({
    title: '',
    category: 'other',
    tags: '',
    isPublic: false
  });

  const fileInputRef = useRef(null);
  const contentRef = useRef(null);
  const mindMapRef = useRef(null);

  // Set up axios interceptor for authentication
  useEffect(() => {
    if (token) {
      api.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);

      console.log('Fetching notes...');
      const response = await api.get(`/notes?${queryParams.toString()}`);
      console.log('Notes response:', response.data);

      if (response.data && Array.isArray(response.data.notes)) {
        setNotes(response.data.notes);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(
        err.response?.data?.error || 
        'Failed to fetch notes. Please check your connection.'
      );
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    } else {
      setLoading(false);
      setError('Please log in to view notes');
    }
  }, [filters, token]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadDetails(prev => ({
        ...prev,
        title: file.name.split('.')[0]
      }));
      handleUpload(file);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadDetails(prev => ({
        ...prev,
        title: file.name.split('.')[0]
      }));
      handleUpload(file);
    }
  };

  const handleUpload = async (file = selectedFile) => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadDetails.title || file.name);
    formData.append('category', uploadDetails.category);
    formData.append('tags', uploadDetails.tags);
    formData.append('isPublic', uploadDetails.isPublic);

    try {
      const response = await api.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', progress);
        }
      });

      if (response.data && response.data.note) {
        setNotes(prevNotes => [response.data.note, ...prevNotes]);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploadDetails({
          title: '',
          category: 'other',
          tags: '',
          isPublic: false
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
  };

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(prevNotes => prevNotes.filter(note => note && note.id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete note');
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedNote) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const content = contentRef.current;
    const mindMap = mindMapRef.current;

    // Add title
    pdf.setFontSize(20);
    pdf.text(selectedNote.title, 20, 20);

    // Add summary
    pdf.setFontSize(12);
    const splitSummary = pdf.splitTextToSize(selectedNote.summary, 170);
    pdf.text(splitSummary, 20, 40);

    // Add mind map if exists
    if (mindMap) {
      const canvas = await html2canvas(mindMap);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 20, pdf.lastAutoTable.finalY + 10, 170, 100);
    }

    pdf.save(`${selectedNote.title}.pdf`);
  };

  const renderContent = (content) => {
    return (
      <div className="prose max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  const renderMindMap = (mindMap) => {
    if (!mindMap || !mindMap.nodes || !mindMap.edges) return null;

    const getNodeStyle = (level) => {
      const styles = {
        central: {
          background: '#3a8dff',
          color: 'white',
          border: '2px solid #2970ff',
          padding: '16px',
          borderRadius: '12px',
          maxWidth: '300px',
          margin: '0 auto 24px auto'
        },
        main: {
          background: '#a182ff',
          color: 'white',
          border: '2px solid #8b5cf6',
          padding: '12px',
          borderRadius: '8px',
          maxWidth: '250px',
          margin: '12px'
        },
        sub: {
          background: '#f8fafc',
          color: '#1e293b',
          border: '2px solid #e2e8f0',
          padding: '10px',
          borderRadius: '8px',
          maxWidth: '220px',
          margin: '8px'
        },
        leaf: {
          background: 'white',
          color: '#475569',
          border: '2px solid #cbd5e1',
          padding: '8px',
          borderRadius: '8px',
          maxWidth: '200px',
          margin: '8px'
        }
      };
      return styles[level] || styles.leaf;
    };

    const renderNode = (node) => {
      const style = getNodeStyle(node.level);
      return (
        <div
          key={node.id}
          style={style}
          className="shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="font-semibold mb-1">{node.label}</div>
          {node.description && (
            <div className="text-sm opacity-90 mt-1">{node.description}</div>
          )}
          {node.importance && (
            <div className="text-xs mt-2 opacity-75">
              Importance: {node.importance}/5
            </div>
          )}
        </div>
      );
    };

    const renderConnection = (edge) => {
      return (
        <div
          key={`${edge.source}-${edge.target}`}
          className="text-sm text-gray-500 mx-4 my-2"
        >
          {edge.relationship && (
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mx-2"></div>
              <span>{edge.relationship}</span>
              <div className="w-2 h-2 bg-gray-300 rounded-full mx-2"></div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto" style={{ maxHeight: '800px' }}>
        <div className="flex flex-col items-center">
          {/* Central Topic */}
          {mindMap.nodes.filter(node => node.level === 'central').map(renderNode)}
          
          {/* Main Branches */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {mindMap.nodes.filter(node => node.level === 'main').map(node => (
              <div key={node.id} className="flex flex-col items-center">
                {renderNode(node)}
                
                {/* Sub Branches */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {mindMap.nodes
                    .filter(subNode => 
                      mindMap.edges.some(edge => 
                        edge.source === node.id && edge.target === subNode.id
                      )
                    )
                    .map(subNode => (
                      <div key={subNode.id} className="flex flex-col items-center">
                        {renderConnection(mindMap.edges.find(edge => 
                          edge.source === node.id && edge.target === subNode.id
                        ))}
                        {renderNode(subNode)}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!token) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your notes
        </Typography>
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3a8dff] to-[#a182ff] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-4">My Notes</h1>
          <p className="text-white/90">Upload and manage your study materials</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div 
          className={`bg-white p-6 rounded-lg shadow-md mb-8 ${
            dragActive ? 'border-2 border-dashed border-blue-500 bg-blue-50' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <h2 className="text-xl font-semibold mb-4">Upload New Note</h2>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.ppt,.pptx,.mp3,.wav,.jpg,.jpeg,.png"
            />
            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 bg-[#3F8CFF] text-white px-6 py-2 rounded font-medium hover:bg-[#3578E5] transition-colors disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
              <p className="text-gray-500">or drag and drop your file here</p>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Notes Grid and Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes List */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F8CFF] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No notes yet. Upload your first note to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id || note._id}
                    onClick={() => handleNoteClick(note)}
                    className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
                      selectedNote?._id === note._id ? 'ring-2 ring-[#3F8CFF]' : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold mb-2">{note.title || 'Untitled Note'}</h3>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {note.fileType?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {note.summary || 'No summary available'}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id || note._id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Detail View */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-[#3F8CFF] text-white rounded hover:bg-[#3578E5] transition-colors"
                    >
                      Download PDF
                    </button>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedNote.processingStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedNote.processingStatus === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedNote.processingStatus}
                    </span>
                  </div>
                </div>

                <div ref={contentRef}>
                  {/* Summary Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Summary</h3>
                    {renderContent(selectedNote.summary)}
                  </div>

                  {/* Key Concepts Section */}
                  {selectedNote.keyConcepts && selectedNote.keyConcepts.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {selectedNote.keyConcepts.map((concept, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-[#3F8CFF]">{concept.concept}</h4>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Importance: {concept.importance}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{concept.description}</p>
                            {concept.examples && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Examples:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {concept.examples.map((example, i) => (
                                    <li key={i}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mind Map Section */}
                  {selectedNote.mindMap && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Mind Map</h3>
                      </div>
                      {renderMindMap(selectedNote.mindMap)}
                    </div>
                  )}

                  {/* Metadata Section */}
                  <div className="border-t pt-4 mt-8">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(selectedNote.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Modified:</span>{' '}
                        {new Date(selectedNote.lastModified).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>{' '}
                        {selectedNote.category}
                      </div>
                      <div>
                        <span className="font-medium">File Type:</span>{' '}
                        {selectedNote.fileType?.toUpperCase()}
                      </div>
                      {selectedNote.aiMetadata && (
                        <>
                          <div>
                            <span className="font-medium">AI Model:</span>{' '}
                            {selectedNote.aiMetadata.model}
                          </div>
                          <div>
                            <span className="font-medium">Processing Time:</span>{' '}
                            {Math.round(selectedNote.aiMetadata.processingTime / 1000)}s
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Select a note to view its details
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog 
        open={openUploadDialog} 
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload New Note</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpload} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={uploadDetails.title}
              onChange={(e) => setUploadDetails({ ...uploadDetails, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadDetails.category}
                label="Category"
                onChange={(e) => setUploadDetails({ ...uploadDetails, category: e.target.value })}
              >
                <MenuItem value="lecture">Lecture</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="study">Study</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={uploadDetails.tags}
              onChange={(e) => setUploadDetails({ ...uploadDetails, tags: e.target.value })}
              sx={{ mb: 2 }}
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              style={{ marginBottom: '16px' }}
            />

            {uploadDetails.uploadProgress > 0 && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <CircularProgress variant="determinate" value={uploadDetails.uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Notes;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadDetails.title || file.name);
    formData.append('category', uploadDetails.category);
    formData.append('tags', uploadDetails.tags);
    formData.append('isPublic', uploadDetails.isPublic);

    try {
      setUploadProgress(0);
      const response = await api.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data && response.data.note) {
        setNotes(prevNotes => [response.data.note, ...prevNotes]);
        setOpenUploadDialog(false);
        setFile(null);
        setUploadProgress(0);
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
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(prevNotes => prevNotes.filter(note => note && note.id !== noteId));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete note');
    }
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Notes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenUploadDialog(true)}
        >
          Add Note
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="lecture">Lecture</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="study">Study</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Search notes"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No notes found. Start by adding a new note!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {notes.map(note => (
            <Grid item xs={12} sm={6} md={4} key={note.id || note._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">
                      {note.title || 'Untitled Note'}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleDelete(note.id || note._id)}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <ShareIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {note.summary && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {note.summary}
                    </Typography>
                  )}

                  {note.tags && Array.isArray(note.tags) && note.tags.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {note.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}

                  <Box display="flex" gap={1}>
                    {note.category && (
                      <Chip
                        label={note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                        size="small"
                        color="secondary"
                      />
                    )}
                    {note.status && (
                      <Chip
                        label={note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={openUploadDialog} 
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload New Note</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFileUpload} sx={{ mt: 2 }}>
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
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginBottom: '16px' }}
            />

            {uploadProgress > 0 && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <CircularProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button onClick={handleFileUpload} variant="contained" disabled={!file}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notes; 
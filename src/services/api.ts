import axios from 'axios';

// API base configuration
const API_BASE_URL = 'https://form-builder-backend-1g3i.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Handle common error cases
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error occurred');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server');
    }
    
    return Promise.reject(error);
  }
);

// Forms API
export const formsApi = {
  // Get all forms
  getForms: async (params = {}) => {
    const response = await api.get('/forms', { params });
    return response.data;
  },

  // Get single form
  getForm: async (id: string) => {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  // Create new form
  createForm: async (formData: any) => {
    const response = await api.post('/forms', formData);
    return response.data;
  },

  // Update form
  updateForm: async (id: string, formData: any) => {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data;
  },

  // Delete form
  deleteForm: async (id: string) => {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  },

  // Publish form
  publishForm: async (id: string) => {
    const response = await api.post(`/forms/${id}/publish`);
    return response.data;
  },

  // Unpublish form
  unpublishForm: async (id: string) => {
    const response = await api.post(`/forms/${id}/unpublish`);
    return response.data;
  },

  // Duplicate form
  duplicateForm: async (id: string) => {
    const response = await api.post(`/forms/${id}/duplicate`);
    return response.data;
  },

  // Get form stats
  getFormStats: async (id: string) => {
    const response = await api.get(`/forms/${id}/stats`);
    return response.data;
  }
};

// Public API (for form submissions)
export const publicApi = {
  // Get published form
  getPublicForm: async (id: string) => {
    const response = await api.get(`/public/forms/${id}`);
    return response.data;
  }
};

// Submissions API
export const submissionsApi = {
  // Submit form data
  submitForm: async (formId: string, submissionData: any) => {
    const response = await api.post(`/forms/${formId}/submit`, submissionData);
    return response.data;
  },

  // Get form submissions
  getSubmissions: async (formId: string, params = {}) => {
    const response = await api.get(`/forms/${formId}/submissions`, { params });
    return response.data;
  },

  // Get single submission
  getSubmission: async (id: string) => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  // Delete submission
  deleteSubmission: async (id: string) => {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },

  // Export submissions as CSV
  exportSubmissions: async (formId: string) => {
    const response = await api.get(`/forms/${formId}/export`, {
      responseType: 'blob' // Important for file downloads
    });
    return response;
  },

  // Get submission statistics
  getSubmissionStats: async (formId: string) => {
    const response = await api.get(`/forms/${formId}/submissions/stats`);
    return response.data;
  }
};

// Files API
export const filesApi = {
  // Upload file
  uploadFile: async (file: File, fieldId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldId', fieldId);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get file URL
  getFileUrl: (filename: string) => {
    return `${API_BASE_URL}/files/${filename}`;
  },

  // Delete file
  deleteFile: async (filename: string) => {
    const response = await api.delete(`/files/${filename}`);
    return response.data;
  },

  // Get file info
  getFileInfo: async (filename: string) => {
    const response = await api.get(`/files/${filename}/info`);
    return response.data;
  }
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const ebooksAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ebooks/upload', formData);
  },
  getAll: () => api.get('/ebooks'),
};

export const questionsAPI = {
  generate: (ebookId, questionTypes, difficulty, numQuestions) =>
    api.post('/questions/generate', {
      ebook_id: ebookId,
      question_types: questionTypes,
      difficulty,
      num_questions: numQuestions,
    }),
  getAll: (ebookId) => api.get('/questions', { params: { ebook_id: ebookId } }),
};

export const assignmentsAPI = {
  generate: (questionIds, studentName, rollNumber, subject, handwritingStyle, penColor) =>
    api.post(
      '/assignments/generate',
      {
        question_ids: questionIds,
        student_name: studentName,
        roll_number: rollNumber,
        subject,
        handwriting_style: handwritingStyle,
        pen_color: penColor,
      },
      { responseType: 'blob' }
    ),
};

export default api;
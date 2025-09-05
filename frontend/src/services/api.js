import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // important for cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log("API response:", api);
// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'API Error';
    return Promise.reject(new Error(errMsg));
  }
);

export default api;

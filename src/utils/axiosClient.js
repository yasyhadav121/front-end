// frontend/src/utils/axiosClient.js
import axios from "axios"

const axiosClient = axios.create({
    baseURL: 'https://backend-second.vercel.app',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for handling 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
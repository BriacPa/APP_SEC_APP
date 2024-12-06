import axios from 'axios';

// Create an Axios instance with default settings
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // The base URL for your API requests (change this if needed)
    withCredentials: true, // Ensures that cookies are included in the request (important for JWT in cookies)
});

export default axiosInstance;

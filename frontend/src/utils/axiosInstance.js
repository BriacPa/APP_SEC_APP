import axios from 'axios';

// Create an Axios instance with default settings
const axiosInstance = axios.create({
    baseURL: 'https://app-sec-app-server-18blk3li4-briacs-projects-8dadbe9b.vercel.app/api', // The base URL for your API requests (change this if needed)
    withCredentials: true, // Ensures that cookies are included in the request (important for JWT in cookies)
});

export default axiosInstance;

import axios from 'axios';

// Set the base URL of the backend
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Automatically add the Access Token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// If a 401 Error occurs, send the Refresh Token
api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

       
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; 

            try {
                const refreshToken = localStorage.getItem('refreshToken');

               // Request a new Access Token from the backend
                const response = await axios.post('http://localhost:8080/api/auth/refresh', {
                    refreshToken: refreshToken
                });

                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);

                originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.log("Session Expired. Please login again.");
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
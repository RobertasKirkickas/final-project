import axios from 'axios';
import Cookies from 'js-cookie';

const apiInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

apiInstance.interceptors.request.use(
	(config) => {
		// Taking the token from cookies and adding it to the request headers
		const token = Cookies.get('access_token');

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor to handle token refresh on 401 errors
apiInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = Cookies.get('refresh_token');

			if (refreshToken) {
				try {
					const response = await axios.post(`${import.meta.env.VITE_API_URL}user/token/refresh/`, {
						refresh: refreshToken,
					});

					const newAccessToken = response.data.access;
					Cookies.set('access_token', newAccessToken);

					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
					return apiInstance(originalRequest);
				} catch (refreshError) {
					Cookies.remove('access_token');
					Cookies.remove('refresh_token');
					window.location.href = '/login';
				}
			}
		}
		return Promise.reject(error);
	},
);

export default apiInstance;

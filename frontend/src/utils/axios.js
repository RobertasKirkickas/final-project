import axios from 'axios';
import Cookies from 'js-cookie';

const apiInstance = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/v1/',
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
	(error) => {
		return Promise.reject(error);
	},
);

export default apiInstance;

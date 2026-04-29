import React from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Custom hook to retrieve user data from JWT tokens stored in cookies
function userData() {
	let access_token = Cookies.get('access_token');
	let refresh_token = Cookies.get('refresh_token');

	if (access_token && refresh_token) {
		const token = refresh_token;
		const decoded = jwtDecode(token);
		return decoded;
	}

	return null; // Return null if tokens are not available or invalid
}

export default userData;

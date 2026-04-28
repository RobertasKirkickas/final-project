import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';

function Logout() {
	const navigate = useNavigate();

	useEffect(() => {
		// Call the logout utility
		logout();

		// Redirect to home page immediately
		navigate('/');
	}, [navigate]);

	return null;
}

export default Logout;

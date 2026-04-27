import { useEffect, useState } from 'react';
import { setUser } from '../utils/auth';
import Header from './Header';
import Footer from './Footer';

const MainWrapper = ({ children }) => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const handler = async () => {
			setLoading(true);
			await setUser(); // Fetch user data and update authentication state
			setLoading(false);
		};

		// Call the 'handler' function immediately after the component is mounted
		handler();
	}, []);

	// Render content conditionally based on the 'loading' state
	return (
		<>
			<Header />
			<main style={{ minHeight: '80vh' }}>{loading ? null : children}</main>
			<Footer />
		</>
	);
};

export default MainWrapper;

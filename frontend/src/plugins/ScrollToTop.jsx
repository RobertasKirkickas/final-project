import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
	// Get the current pathname from the router location
	const { pathname } = useLocation();

	useEffect(() => {
		// Scroll to the top of the page whenever the pathname changes
		window.scrollTo(0, 0);
	}, [pathname]); // Ensures this runs only when the pathname changes

	return null;
};

export default ScrollToTop;

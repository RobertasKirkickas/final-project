import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiInstance from '../../utils/axios';

function Categories() {
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			const response = await apiInstance.get('post/category/list/');
			setCategories(response.data);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching categories:', error);
			setIsLoading(false);
		}
	};

	// Function to determine icon class based on category slug
	const getCategoryIcon = (slug) => {
		if (!slug) return 'bi-folder-fill text-muted';

		const s = slug.toLowerCase();

		if (s.includes('transport') || s.includes('bus')) return 'bi-bus-front-fill text-danger'; // Transport and bus stops
		if (s.includes('playground')) return 'bi-balloon-fill text-danger'; // Playgrounds and kids' areas
		if (s.includes('sport') || s.includes('recreation')) return 'bi-dribbble text-warning'; // Sports and recreation grounds
		if (s.includes('alley') || s.includes('footpath') || s.includes('path')) return 'bi-signpost-split-fill text-secondary'; // Public alleyways and footpaths
		if (s.includes('school') || s.includes('education')) return 'bi-book-half text-info'; // School zones
		if (s.includes('commercial') || s.includes('shop')) return 'bi-shop text-primary'; // Commercial zones
		if (s.includes('residential') || s.includes('street')) return 'bi-house-heart-fill text-warning'; // Residential streets
		if (s.includes('nature') || s.includes('reserve')) return 'bi-compass-fill text-success'; // Nature reserves
		if (s.includes('waterfront')) return 'bi-water text-info'; // Waterfront
		if (s.includes('park')) return 'bi-tree-fill text-success'; // Parks

		return 'bi-folder-fill text-muted';
	};

	if (isLoading) {
		return (
			<div className='d-flex justify-content-center align-items-center vh-100'>
				<div className='spinner-border text-success' role='status' />
			</div>
		);
	}

	return (
		<section className='py-5 bg-light' style={{ minHeight: '85vh' }}>
			<div className='container d-flex flex-column' style={{ minHeight: '70vh' }}>
				{/* Header */}
				<div className='text-center mb-5'>
					<h1 className='display-5 fw-bold text-dark' style={{ color: '#1a2d23' }}>
						Browse Categories
					</h1>
					<p className='text-muted mx-auto' style={{ maxWidth: '600px' }}>
						Select a category below to explore reported litter spots, join scheduled clean-up events, or report new issues in that area.
					</p>
				</div>

				{/* Categories */}
				{categories.length > 0 ? (
					<div className='row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4'>
						{categories.map((c) => (
							<div key={c.id} className='col'>
								<Link to={`/category/${c.slug}/`} className='text-decoration-none text-dark h-100 d-block'>
									<div
										className='card border-0 shadow-sm h-100 rounded-4 p-4 text-center transition-card'
										style={{
											transition: 'transform 0.2s ease, box-shadow 0.2s ease',
											backgroundColor: '#fff',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = 'translateY(-5px)';
											e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = 'translateY(0)';
											e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,0.075)';
										}}
									>
										{/* Icon container */}
										<div
											className='rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3'
											style={{
												width: '70px',
												height: '70px',
												backgroundColor: '#f8f9fa',
												fontSize: '1.8rem',
											}}
										>
											<i className={`bi ${getCategoryIcon(c.slug)}`}></i>
										</div>

										{/* Category title and description */}
										<h4 className='fw-bold mb-2 h5' style={{ color: '#1a2d23' }}>
											{c.title}
										</h4>
										<p className='text-muted small mb-4 flex-grow-1' style={{ lineHeight: '1.5' }}>
											{c.description || 'Explore reports and scheduled clean-up events in this area.'}
										</p>
									</div>
								</Link>
							</div>
						))}
					</div>
				) : (
					/* Empty state when no categories are found */
					<div className='d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 my-auto' style={{ minHeight: '40vh' }}>
						<h4 className='fw-bold text-muted mb-2'>No categories found</h4>
					</div>
				)}
			</div>
		</section>
	);
}

export default Categories;

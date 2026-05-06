import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import moment from 'moment';
import apiInstance from '../../utils/axios';

function Category() {
	const { slug } = useParams();
	const [category, setCategory] = useState(null);
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchCategoryPosts();
	}, [slug]);

	const fetchCategoryPosts = async () => {
		setIsLoading(true);
		try {
			const response = await apiInstance.get(`post/category/posts/${slug}/`);

			// Fetch the category details and posts from the response
			if (response.data.category) {
				setCategory(response.data.category);
				setPosts(response.data.posts || []);
			}
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching category posts:', error);
			setIsLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'Reported':
				return <span className='badge bg-danger text-white rounded-pill px-3 py-1'>Reported</span>;
			case 'Scheduled':
				return <span className='badge bg-warning text-dark rounded-pill px-3 py-1'>Scheduled</span>;
			case 'Cleared':
				return <span className='badge bg-success text-white rounded-pill px-3 py-1'>Cleared</span>;
			default:
				return null;
		}
	};

	// Helper function to prevent layout breaking by long texts
	const truncateText = (text, maxLength) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
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
				{/* Link to go back to all categories */}
				<div className='mb-4'>
					<Link to='/categories/' className='btn btn-link text-success fw-bold p-0 text-decoration-none d-inline-flex align-items-center gap-1'>
						<i className='bi bi-arrow-left'></i> Back to all categories
					</Link>
				</div>

				{/* Category header */}
				{category && (
					<div className='mb-5 p-4 rounded-4 bg-white shadow-sm border-start border-4 border-success'>
						<h1 className='display-6 fw-bold text-dark mb-2'>{category.title}</h1>
						<p className='text-muted mb-0' style={{ maxWidth: '800px', lineHeight: '1.6' }}>
							{category.description || 'Explore active litter reports and scheduled community clean-up events in this area.'}
						</p>
					</div>
				)}

				{/* List of reports */}
				{posts.length > 0 ? (
					<div className='row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4'>
						{posts.map((post) => (
							<div key={post.id} className='col'>
								<Link to={`/${post.slug}/`} className='text-decoration-none text-dark h-100 d-block'>
									<div
										className='card border-0 shadow-sm h-100 rounded-4 overflow-hidden transition-card'
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
										{/* Report image with status */}
										<div className='position-relative' style={{ height: '220px' }}>
											<img src={post.image} className='w-100 h-100' style={{ objectFit: 'cover' }} alt={post.title} />
											<div className='position-absolute top-0 start-0 m-3'>{getStatusBadge(post.status)}</div>
										</div>

										{/* Report details */}
										<div className='card-body p-4 d-flex flex-column'>
											<h5 className='fw-bold text-dark mb-2' style={{ color: '#1a2d23' }}>
												{truncateText(post.title, 45)}
											</h5>
											<p className='text-muted small mb-4 flex-grow-1' style={{ lineHeight: '1.5' }}>
												{truncateText(post.description, 95)}
											</p>

											{/* Post metadata (date, likes, views) */}
											<div className='mt-auto pt-3 border-top d-flex justify-content-between align-items-center text-muted small' style={{ fontSize: '11px' }}>
												<div>
													<i className='bi bi-calendar-event me-1'></i>
													{moment(post.date).format('MMM DD, YYYY')}
												</div>
												<div className='d-flex gap-3'>
													<span>
														<i className='bi bi-hand-thumbs-up-fill me-1'></i>
														{post.likes?.length || 0}
													</span>
													<span>
														<i className='bi bi-eye-fill me-1'></i>
														{post.view || 0}
													</span>
												</div>
											</div>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
				) : (
					/* Empty state when no posts are found in this category */
					<div className='d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 my-auto' style={{ minHeight: '40vh' }}>
						<h4 className='fw-bold text-muted mb-2'>This category is empty!</h4>
						<p className='text-muted small mx-auto mb-4' style={{ maxWidth: '400px' }}>
							There are currently no reported litter spots or scheduled events here. If you see litter in this area, be the first to report it!
						</p>
						<Link to='/dashboard/add-post/' className='btn btn-success rounded-pill px-4 fw-bold shadow-sm'>
							<i className='bi bi-plus-circle-fill me-2'></i>Report Litter Spot
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

export default Category;

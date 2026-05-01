import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import apiInstance from '../../utils/axios';
import Toast from '../../plugins/Toast';
import userData from '../../plugins/userData';

function Index() {
	const [posts, setPosts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	const user = userData();

	const [trendingPage, setTrendingPage] = useState(1);
	const [latestPage, setLatestPage] = useState(1);
	const postsPerPage = 4;
	const categoryRef = useRef(null);

	// Helper function to prevent layout breaking by long texts
	const truncateText = (text, maxLength) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Fetch posts and categories from backend
	const fetchData = async () => {
		try {
			const [postsRes, categoryRes] = await Promise.all([apiInstance.get('post/lists/'), apiInstance.get('post/category/list/')]);
			setPosts(postsRes.data);
			setCategories(categoryRes.data);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching home data:', error);
			setLoading(false);
		}
	};

	const allTrendingPosts = [...posts].sort((a, b) => (b.view || 0) - (a.view || 0));
	const trendingTotalPages = Math.ceil(allTrendingPosts.length / postsPerPage);
	const currentTrendingPosts = allTrendingPosts.slice((trendingPage - 1) * postsPerPage, trendingPage * postsPerPage);

	const allLatestPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
	const latestTotalPages = Math.ceil(allLatestPosts.length / postsPerPage);
	const currentLatestPosts = allLatestPosts.slice((latestPage - 1) * postsPerPage, latestPage * postsPerPage);

	// Categories carousel
	const scrollCategories = (direction) => {
		if (categoryRef.current) {
			const { scrollLeft, clientWidth } = categoryRef.current;
			const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
			categoryRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
		}
	};

	// Check if the user has liked or saved the post
	const checkStatus = (post, type) => {
		if (!user || !post) return false;
		if (type === 'like') {
			return post.likes?.some((u) => (u.id || u) == user.user_id);
		}
		if (type === 'save') {
			return post.bookmark_user_ids?.some((id) => id == user.user_id);
		}
		return false;
	};

	const handleInteraction = async (e, post, type) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user) {
			Toast('error', `Please login to ${type === 'like' ? 'like' : 'save'} reports`, '');
			return;
		}

		const isCurrentlyActive = checkStatus(post, type);

		try {
			const endpoint = type === 'like' ? 'post/like-post/' : 'post/bookmark-post/';

			await apiInstance.post(endpoint, {
				post_id: post.id,
				user_id: user.user_id,
			});

			// Show appropriate toast message based on action
			const actionText = type === 'like' ? (isCurrentlyActive ? 'Unliked' : 'Liked') : isCurrentlyActive ? 'Unsaved' : 'Saved';

			Toast('success', `Report ${actionText}`, '');

			// Re-fetch data to sync icons
			fetchData();
		} catch (error) {
			console.error('Interaction error:', error);
			Toast('error', `Failed to process ${type}`, '');
		}
	};

	if (loading) {
		return (
			<div className='d-flex align-items-center justify-content-center vh-100'>
				<div className='spinner-border text-success' role='status'></div>
			</div>
		);
	}

	return (
		<div className='bg-light min-vh-100'>
			{/* Hero section */}
			<section className='py-5 text-white' style={{ backgroundColor: '#1a2d23' }}>
				<div className='container py-lg-5 text-center text-lg-start'>
					<h1 className='display-4 fw-bold mb-3'>Ipswich IP3 Area Litter Reports</h1>
					<p className='lead opacity-75 mb-4'>Submit your litter reports and stay informed.</p>
					<div className='d-flex gap-3 justify-content-center justify-content-lg-start'>
						<Link to='/dashboard/add-post/' className='btn btn-success btn-lg px-4 rounded-pill fw-bold shadow'>
							Submit Report
						</Link>
						<a href='#latest' className='btn btn-outline-light btn-lg px-4 rounded-pill'>
							View Latest
						</a>
					</div>
				</div>
			</section>

			{/* Trending reports */}
			<section className='py-5' id='trending'>
				<div className='container'>
					<h2 className='fw-bold mb-4 h3 border-bottom pb-2'>Trending Reports 🔥</h2>
					<div className='row'>
						{currentTrendingPosts.map((post) => {
							const isLiked = checkStatus(post, 'like');
							const isSaved = checkStatus(post, 'save');

							return (
								<div className='col-lg-3 col-md-6 mb-4' key={post.id}>
									<div className='card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative'>
										<img src={post.image} className='card-img-top' style={{ height: '180px', objectFit: 'cover' }} alt={post.title} />
										<div className='card-body p-3'>
											<h5 className='card-title fw-bold h6 mb-3'>
												<Link to={`/${post.slug}/`} className='text-dark text-decoration-none stretched-link'>
													{truncateText(post.title, 30)}
												</Link>
											</h5>

											<div className='d-flex gap-3 mb-3 position-relative' style={{ zIndex: 2 }}>
												{/* Like button */}
												<button onClick={(e) => handleInteraction(e, post, 'like')} className='btn btn-link p-0 border-0 bg-transparent'>
													<i className={`bi bi-hand-thumbs-up-fill ${isLiked ? 'text-secondary opacity-50' : 'text-primary'}`}></i>
												</button>

												{/* Save button */}
												<button onClick={(e) => handleInteraction(e, post, 'save')} className='btn btn-link p-0 border-0 bg-transparent d-flex align-items-center text-decoration-none'>
													<i className={`bi bi-bookmark-heart-fill me-1 ${isSaved ? 'text-secondary opacity-50' : 'text-danger'}`}></i>
													<span className={`small fw-bold ${isSaved ? 'text-secondary opacity-50' : 'text-danger'}`}>Save</span>
												</button>
											</div>

											<div className='text-muted small'>
												<div className='mb-1'>
													<i className='bi bi-person-fill text-success me-2'></i>
													{post.user?.full_name || 'Publisher'}
												</div>
												<div className='mb-1'>
													<i className='bi bi-calendar-event me-2'></i>
													{moment(post.date).format('MMM DD, YYYY')}
												</div>
												<div className='text-dark'>
													<i className='bi bi-eye-fill me-2'></i>
													{post.view} Views
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{trendingTotalPages > 1 && (
						<nav className='mt-4 d-flex justify-content-center'>
							<ul className='pagination gap-2 border-0'>
								<li className={`page-item ${trendingPage === 1 ? 'disabled' : ''}`}>
									<button onClick={() => setTrendingPage(trendingPage - 1)} className='page-link rounded-circle border-0 shadow-sm'>
										<i className='bi bi-arrow-left'></i>
									</button>
								</li>
								{[...Array(trendingTotalPages)].map((_, i) => (
									<li key={i} className={`page-item ${trendingPage === i + 1 ? 'active' : ''}`}>
										<button onClick={() => setTrendingPage(i + 1)} className={`page-link rounded-circle border-0 shadow-sm ${trendingPage === i + 1 ? 'bg-success text-white' : 'bg-white text-dark'}`}>
											{i + 1}
										</button>
									</li>
								))}
								<li className={`page-item ${trendingPage === trendingTotalPages ? 'disabled' : ''}`}>
									<button onClick={() => setTrendingPage(trendingPage + 1)} className='page-link rounded-circle border-0 shadow-sm'>
										<i className='bi bi-arrow-right'></i>
									</button>
								</li>
							</ul>
						</nav>
					)}
				</div>
			</section>

			{/* Categories carousel */}
			<section className='py-5 bg-white position-relative'>
				<div className='container'>
					<div className='d-flex align-items-center justify-content-between mb-4'>
						<h2 className='fw-bold h4 mb-0'>Explore Categories</h2>
						<div className='d-flex gap-2'>
							<button onClick={() => scrollCategories('left')} className='btn btn-outline-success btn-sm rounded-circle'>
								<i className='bi bi-chevron-left'></i>
							</button>
							<button onClick={() => scrollCategories('right')} className='btn btn-outline-success btn-sm rounded-circle'>
								<i className='bi bi-chevron-right'></i>
							</button>
						</div>
					</div>
					<div className='d-flex overflow-hidden gap-4 pb-3' ref={categoryRef} style={{ scrollSnapType: 'x mandatory' }}>
						{categories?.map((c) => (
							<Link key={c.id} to={`/category/${c.slug}/`} className='text-decoration-none text-dark flex-shrink-0' style={{ scrollSnapAlign: 'start' }}>
								<div className='card border-0 shadow-sm rounded-4 text-center' style={{ width: '180px' }}>
									<img src={c.image} className='rounded-top-4' style={{ height: '100px', objectFit: 'cover' }} alt={c.title} />
									<div className='p-3 small'>
										<h6 className='fw-bold mb-1'>{c.title}</h6>
										<span className='badge bg-success bg-opacity-10 text-success'>{c.post_count} Reports</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Latest reports section */}
			<section className='py-5' id='latest'>
				<div className='container'>
					<h2 className='fw-bold mb-4 h3 border-bottom pb-2'>Latest Reports 🕒</h2>
					<div className='row'>
						{currentLatestPosts.map((post) => (
							<div className='col-lg-3 col-md-6 mb-4' key={post.id}>
								<div className='card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative card-hover'>
									<img src={post.image} className='card-img-top' style={{ height: '160px', objectFit: 'cover' }} alt={post.title} />
									<div className='card-body p-3 text-center'>
										<h5 className='card-title fw-bold h6 mb-1'>
											<Link to={`/${post.slug}/`} className='text-dark text-decoration-none stretched-link'>
												{truncateText(post.title, 30)}
											</Link>
										</h5>
										<small className='text-muted'>{moment(post.date).fromNow()}</small>
									</div>
								</div>
							</div>
						))}
					</div>

					{latestTotalPages > 1 && (
						<nav className='mt-4 d-flex justify-content-center'>
							<ul className='pagination gap-2 border-0'>
								<li className={`page-item ${latestPage === 1 ? 'disabled' : ''}`}>
									<button onClick={() => setLatestPage(latestPage - 1)} className='page-link rounded-circle border-0 shadow-sm'>
										<i className='bi bi-arrow-left'></i>
									</button>
								</li>
								{[...Array(latestTotalPages)].map((_, i) => (
									<li key={i} className={`page-item ${latestPage === i + 1 ? 'active' : ''}`}>
										<button onClick={() => setLatestPage(i + 1)} className={`page-link rounded-circle border-0 shadow-sm ${latestPage === i + 1 ? 'bg-success text-white' : 'bg-white text-dark'}`}>
											{i + 1}
										</button>
									</li>
								))}
								<li className={`page-item ${latestPage === latestTotalPages ? 'disabled' : ''}`}>
									<button onClick={() => setLatestPage(latestPage + 1)} className='page-link rounded-circle border-0 shadow-sm'>
										<i className='bi bi-arrow-right'></i>
									</button>
								</li>
							</ul>
						</nav>
					)}
				</div>
			</section>
		</div>
	);
}

export default Index;

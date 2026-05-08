import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import moment from 'moment';
import apiInstance from '../../utils/axios';
import Toast from '../../plugins/Toast';
import userData from '../../plugins/userData';

function Details() {
	const [post, setPost] = useState({});
	const [tags, setTags] = useState([]);
	const [comment, setComment] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [visibleComments, setVisibleComments] = useState(5);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [userProfile, setUserProfile] = useState(null);

	const { slug } = useParams();
	const user = userData();

	// Helper function to prevent layout breaking by long texts
	const truncateText = (text, maxLength) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};

	// Carousel images
	const allImages = post.image ? [post.image, ...(post.additional_images?.map((img) => img.image) || [])] : [];

	const defaultAvatar = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/solid/user.svg';

	const getAvatar = (imagePath) => {
		if (!imagePath || imagePath.includes('default-user.jpg') || imagePath.includes('default.jpg') || imagePath.includes('default/default-user.jpg')) {
			return defaultAvatar;
		}

		if (imagePath.startsWith('/')) {
			const baseURL = apiInstance.defaults.baseURL || 'http://127.0.0.1:8000/';
			try {
				const origin = new URL(baseURL).origin;
				return `${origin}${imagePath}`;
			} catch (e) {
				return `http://127.0.0.1:8000${imagePath}`;
			}
		}
		return imagePath;
	};

	useEffect(() => {
		fetchPostData();
		if (user?.user_id) {
			fetchProfile();
		}
	}, [slug]);

	// Fetch post details
	const fetchPostData = async () => {
		try {
			const response = await apiInstance.get(`post/detail/${slug}/`);
			setPost(response.data);
			setIsLoading(false);
			if (response.data.tags) {
				setTags(response.data.tags.split(','));
			}
		} catch (error) {
			console.error('Error fetching post details:', error);
			setIsLoading(false);
		}
	};

	// Fetch current user profile
	const fetchProfile = async () => {
		try {
			const res = await apiInstance.get(`user/profile/${user.user_id}/`);
			setUserProfile(res.data);
		} catch (error) {
			console.error('Error fetching current user profile:', error);
		}
	};

	// Report status details
	const getStatusDetails = (status) => {
		switch (status) {
			case 'Reported':
				return { class: 'bg-danger text-white', label: 'Reported' };
			case 'Scheduled':
				return { class: 'bg-warning text-dark', label: 'Clean-up Scheduled' };
			case 'Cleared':
				return { class: 'bg-success text-white', label: 'Cleared' };
			default:
				return null;
		}
	};

	// Get status details for dynamic status container
	const statusDetails = getStatusDetails(post.status);

	// Handle Like and Save interactions
	const handleInteraction = async (type) => {
		if (!user) {
			Toast('error', `Please login to ${type === 'like' ? 'like' : 'save'} reports`, '');
			return;
		}

		const isLike = type === 'like';
		const endpoint = isLike ? 'post/like-post/' : 'post/bookmark-post/';

		try {
			const response = await apiInstance.post(endpoint, {
				post_id: post.id,
				user_id: user.user_id,
			});

			const actionText = response.data.message.includes('Un') ? (isLike ? 'Unliked' : 'Unsaved') : isLike ? 'Liked' : 'Saved';
			Toast('success', `Report ${actionText}`, '');

			if (isLike) {
				const updatedLikes = [...(post.likes || [])];
				const userIdx = updatedLikes.findIndex((u) => u.id == user.user_id);
				if (userIdx > -1) updatedLikes.splice(userIdx, 1);
				else updatedLikes.push({ id: user.user_id });
				setPost({ ...post, likes: updatedLikes });
			} else {
				const updatedBookmarks = [...(post.bookmark_user_ids || [])];
				const bIdx = updatedBookmarks.indexOf(user.user_id);
				if (bIdx > -1) updatedBookmarks.splice(bIdx, 1);
				else updatedBookmarks.push(user.user_id);
				setPost({ ...post, bookmark_user_ids: updatedBookmarks });
			}
		} catch (error) {
			Toast('error', `Failed to process ${type}`, '');
		}
	};

	// Handle join/leave clean-up event
	const handleJoinEvent = async () => {
		if (!user) {
			Toast('error', 'Please login to join clean-up events', '');
			return;
		}
		try {
			const response = await apiInstance.post('post/join/', {
				post_id: post.id,
				user_id: user.user_id,
			});
			const actionText = response.data.message.includes('Left') ? 'Left the event' : 'Joined the event';
			Toast('success', actionText, '');
			fetchPostData();
		} catch (error) {
			console.error(error);
			Toast('error', 'Failed to update event status', '');
		}
	};

	// Handle comment submission
	const handleCreateCommentSubmit = async (e) => {
		e.preventDefault();
		if (!comment) {
			Toast('error', 'Comment cannot be empty', '');
			return;
		}

		try {
			await apiInstance.post(`post/comment-post/`, {
				post_id: post.id,
				name: user.full_name || user.username,
				email: user.email,
				comment: comment,
			});

			Toast('success', 'Comment posted successfully', '');
			setComment('');
			fetchPostData();
		} catch (error) {
			console.error('Comment error:', error);
			Toast('error', 'Failed to post comment', '');
		}
	};

	if (isLoading) {
		return (
			<div className='d-flex justify-content-center align-items-center vh-100'>
				<div className='spinner-border text-success' role='status' />
			</div>
		);
	}

	const isLiked = post.likes?.some((u) => u.id == user?.user_id);
	const isSaved = post.bookmark_user_ids?.some((id) => id == user?.user_id);
	const isJoined = post.attendees?.some((u) => u.id == user?.user_id);

	// Facebook URL helper
	const getFacebookUrl = (fbValue) => {
		if (!fbValue) return '#';
		if (fbValue.startsWith('http://') || fbValue.startsWith('https://')) {
			return fbValue;
		}
		return `https://facebook.com/${fbValue}`;
	};

	return (
		<section className='mt-5'>
			<div className='container'>
				<div className='row'>
					{/* Left sidebar */}
					<div className='col-lg-2'>
						<div className='text-start text-lg-center mb-5'>
							<div className='position-relative'>
								<div className='avatar avatar-xl'>
									<img
										className='avatar-img'
										style={{
											width: '80px',
											height: '80px',
											objectFit: 'cover',
											borderRadius: '50%',
											border: '1px solid #dee2e6',
											padding: post.profile?.image ? '0' : '10px',
											backgroundColor: '#f8f9fa',
										}}
										src={getAvatar(post.profile?.image)}
										alt='avatar'
									/>
								</div>
								<span className='h6 fw-bold text-dark mt-2 mb-0 d-block'>{post.profile?.full_name || post.user?.username}</span>
								<p className='small text-muted'>{truncateText(post.profile?.bio || '', 100)}</p>
							</div>

							<hr className='d-none d-lg-block' />

							<ul className='list-inline list-unstyled small text-start'>
								<li className='my-2'>
									<i className='bi bi-calendar-event me-2'></i>
									{moment(post.date).format('MMM DD, YYYY')}
								</li>
								<li className='my-2'>
									<i className={`bi bi-hand-thumbs-up-fill me-2 ${isLiked ? 'text-primary' : 'text-secondary'}`}></i>
									{post.likes?.length || 0} Likes
								</li>
								<li className='my-2'>
									<i className='bi bi-eye-fill me-2'></i>
									{post.view} Views
								</li>
							</ul>

							{/* Interaction buttons */}
							<div className='d-flex flex-column gap-2 mt-3'>
								<button onClick={() => handleInteraction('like')} className={`btn btn-sm ${isLiked ? 'btn-primary' : 'btn-outline-primary'}`}>
									<i className='bi bi-hand-thumbs-up-fill me-1'></i> {isLiked ? 'Liked' : 'Like'}
								</button>
								<button onClick={() => handleInteraction('save')} className={`btn btn-sm ${isSaved ? 'btn-danger' : 'btn-outline-danger'}`}>
									<i className='bi bi-bookmark-heart-fill me-1'></i> {isSaved ? 'Saved' : 'Save'}
								</button>
							</div>

							{/* Tags section */}
							<div className='mt-3 text-start'>
								{tags.map((tag, i) => (
									<span key={i} className='badge bg-light text-secondary border me-1 mb-1' style={{ fontSize: '10px' }}>
										#{tag.trim()}
									</span>
								))}
							</div>

							{/* Report status section */}
							{statusDetails && (
								<div className='card border-0 bg-light rounded-3 p-3 mt-4 text-start shadow-sm'>
									<h6 className='small fw-bold text-muted mb-2' style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
										REPORT STATUS
									</h6>
									<span className={`badge rounded-pill ${statusDetails.class} d-inline-block py-1 px-3 mb-1`} style={{ fontSize: '11px' }}>
										{statusDetails.label}
									</span>

									{post.scheduled_date && (
										<div className='mt-3 pt-2 border-top' style={{ fontSize: '12px' }}>
											<div className='fw-bold text-muted mb-1' style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
												SCHEDULED CLEAN-UP:
											</div>
											<div className='text-dark fw-semibold'>
												<i className='bi bi-calendar3 me-1 text-primary'></i>
												{moment(post.scheduled_date).format('MMM DD, YYYY')}
											</div>
											{post.scheduled_time && (
												<div className='text-dark fw-semibold mt-1'>
													<i className='bi bi-clock me-1 text-primary'></i>
													{post.scheduled_time.slice(0, 5)}
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Main content */}
					<div className='col-lg-10 mb-5'>
						<div className='mb-4'>
							<Link to={`/category/${post.category?.slug}/`} className='badge bg-danger mb-2 text-decoration-none uppercase'>
								{post.category?.title || 'General'}
							</Link>
							<h1 className='display-6 fw-bold text-dark'>{post.title}</h1>
						</div>

						{/* Carousel */}
						<div className='position-relative mb-4 rounded-4 overflow-hidden shadow-sm bg-black' style={{ height: '450px' }}>
							{allImages.length > 0 && (
								<>
									<img src={allImages[activeImageIndex]} className='w-100 h-100' style={{ objectFit: 'contain' }} alt='report' />
									{allImages.length > 1 && (
										<>
											<button
												className='btn btn-dark btn-sm position-absolute top-50 start-0 ms-3 rounded-circle'
												onClick={() => setActiveImageIndex((activeImageIndex - 1 + allImages.length) % allImages.length)}
											>
												<i className='bi bi-chevron-left'></i>
											</button>
											<button className='btn btn-dark btn-sm position-absolute top-50 end-0 me-3 rounded-circle' onClick={() => setActiveImageIndex((activeImageIndex + 1) % allImages.length)}>
												<i className='bi bi-chevron-right'></i>
											</button>
										</>
									)}
								</>
							)}
						</div>

						{/* Description section */}
						<div className='card border-0 shadow-sm bg-white rounded-4 p-4 mb-4'>
							<p className='lead' style={{ whiteSpace: 'pre-line', color: '#333', lineHeight: '1.8', fontSize: '1.1rem' }}>
								{post.description}
							</p>

							<div className='d-flex flex-wrap align-items-center justify-content-between mt-4 gap-2'>
								<div className='d-flex flex-wrap gap-1'>
									{tags.map((tag, i) => (
										<span key={i} className='badge bg-light text-secondary border' style={{ fontSize: '12px' }}>
											#{tag.trim()}
										</span>
									))}
								</div>

								{/* Join/Leave clean up button */}
								<div className='d-flex align-items-center gap-3 flex-wrap'>
									<span className='small text-muted fw-semibold'>
										<strong className='text-dark fw-bold'>{post.attendees?.length || 0}</strong> participants {post.attendees?.length === 1 ? 'has' : 'have'} already joined this clean up.
									</span>
									<button onClick={handleJoinEvent} className={`btn rounded-pill px-4 fw-bold shadow-sm ${isJoined ? 'btn-danger' : 'btn-success'}`}>
										<i className={`bi ${isJoined ? 'bi-box-arrow-right' : 'bi-person-plus-fill'} me-2`}></i>
										{isJoined ? 'Leave Clean Up' : 'Join Clean Up'}
									</button>
								</div>
							</div>
						</div>

						{/* Reporter section */}
						<div className='card border-0 shadow-sm bg-white rounded-4 p-4 my-5 border-start border-4 border-success'>
							<div className='d-flex align-items-center'>
								<img
									src={getAvatar(post.profile?.image)}
									className='rounded-circle shadow-sm me-3'
									style={{ width: '70px', height: '70px', objectFit: 'cover', border: '1px solid #dee2e6', padding: post.profile?.image ? '0' : '8px', backgroundColor: '#f8f9fa' }}
									alt=''
								/>
								<div>
									<h5 className='mb-0 fw-bold'>{post.profile?.full_name || post.user?.username}</h5>
									<p className='mb-2 text-muted small'>{post.user?.email}</p>
									<a
										href={getFacebookUrl(post.profile?.facebook)}
										target='_blank'
										rel='noopener noreferrer'
										className={`btn btn-sm btn-primary rounded-pill px-3 ${!post.profile?.facebook ? 'disabled opacity-50' : ''}`}
									>
										<i className='bi bi-facebook me-2'></i>Facebook
									</a>
								</div>
							</div>
						</div>

						<hr />

						{/* Comments section */}
						<div className='mt-5'>
							<h4 className='fw-bold mb-4'>
								<i className='bi bi-chat-left-text me-2'></i>Comments ({post.comments?.length || 0})
							</h4>

							{user ? (
								<div className='bg-light p-4 rounded-4 mb-5 shadow-sm'>
									<div className='d-flex align-items-center mb-3'>
										<img
											src={getAvatar(userProfile?.image)}
											style={{
												width: '30px',
												height: '30px',
												objectFit: 'cover',
												borderRadius: '50%',
												border: '1px solid #dee2e6',
												padding: userProfile?.image ? '0' : '4px',
												backgroundColor: '#f8f9fa',
											}}
											className='rounded-circle me-2 border'
											alt=''
										/>
										<span className='fw-bold small'>{user.full_name || user.username}</span>
									</div>
									<form onSubmit={handleCreateCommentSubmit}>
										<textarea
											onChange={(e) => setComment(e.target.value)}
											value={comment}
											className='form-control border-0 shadow-none mb-3'
											rows={3}
											placeholder='Share your thoughts on this report...'
											style={{ backgroundColor: '#fff', borderRadius: '12px' }}
										/>
										<button type='submit' className='btn btn-success px-4 fw-bold rounded-pill'>
											Post Comment
										</button>
									</form>
								</div>
							) : (
								<div className='alert alert-secondary rounded-4 mb-5 border-0 text-center py-4'>
									Please{' '}
									<Link to='/login' className='fw-bold'>
										login
									</Link>{' '}
									to comment.
								</div>
							)}

							{/* Comments list */}
							<div
								className='pe-2 mb-4'
								style={{
									maxHeight: '400px',
									overflowY: 'auto',
									border: post.comments?.length > 0 ? '1px solid #e3e6ec' : 'none',
									borderRadius: '16px',
									padding: post.comments?.length > 0 ? '15px' : '0',
									backgroundColor: post.comments?.length > 0 ? '#fcfcfd' : 'transparent',
								}}
							>
								{post.comments?.length > 0 ? (
									post.comments.slice(0, visibleComments).map((c, i) => (
										<div className='mb-4 d-flex' key={i}>
											<div className='flex-shrink-0'>
												<img
													src={getAvatar(c.profile_image)}
													style={{
														width: '40px',
														height: '40px',
														objectFit: 'cover',
														borderRadius: '50%',
														border: '1px solid #dee2e6',
														padding: c.profile_image ? '0' : '6px',
														backgroundColor: '#f8f9fa',
													}}
													className='rounded-circle shadow-sm'
													alt='avatar'
												/>
											</div>
											<div className='ms-3 w-100'>
												<div className='bg-white border shadow-sm p-3 rounded-4'>
													<div className='d-flex justify-content-between align-items-center mb-1'>
														<h6 className='fw-bold mb-0 small'>{c.name}</h6>
														<small className='text-muted' style={{ fontSize: '10px' }}>
															{moment(c.date).fromNow()}
														</small>
													</div>
													<p className='mb-0 text-dark small' style={{ lineHeight: '1.4' }}>
														{c.comment}
													</p>
												</div>

												{/* Reporter's reply, if exists */}
												{c.reply && (
													<div className='mt-2 ms-4'>
														<div className='p-3 rounded-4 border-start border-4 border-success shadow-sm' style={{ backgroundColor: '#f8f9fa' }}>
															<div className='d-flex align-items-center mb-1'>
																<h6 className='fw-bold mb-0 small text-success'>{user.full_name || user.username}</h6>
															</div>
															<p className='mb-0 text-muted small' style={{ lineHeight: '1.4' }}>
																{c.reply}
															</p>
														</div>
													</div>
												)}
											</div>
										</div>
									))
								) : (
									<p className='text-center text-muted py-5'>No comments yet. Be the first!</p>
								)}

								{/* 'Load more comments' button */}
								{post.comments?.length > visibleComments && (
									<div className='text-center pt-2'>
										<button onClick={() => setVisibleComments((v) => v + 5)} className='btn btn-outline-success btn-sm rounded-pill px-4 fw-bold shadow-sm'>
											Load More Comments
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Details;

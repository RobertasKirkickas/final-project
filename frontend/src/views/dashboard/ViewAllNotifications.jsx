import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import apiInstance from '../../utils/axios';
import { useAuthStore } from '../../store/auth';

function ViewAllNotifications() {
	const [notifications, setNotifications] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [visibleCount, setVisibleCount] = useState(15);

	// Get logged-in user data
	const user = useAuthStore((state) => state.user);
	const userId = user()?.user_id;

	useEffect(() => {
		if (userId) {
			fetchNotifications();
		}
	}, [userId]);

	const fetchNotifications = async () => {
		setIsLoading(true);
		try {
			// Fetch notifications for the specific user
			const response = await apiInstance.get(`dashboard/noti-list/${userId}/`);
			setNotifications(response.data || []);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching notifications:', error);
			setIsLoading(false);
		}
	};

	// Load more notifications
	const handleLoadMore = () => {
		setVisibleCount((prevCount) => prevCount + 15);
	};

	// Helper to get icon and title based on notification type
	const getNotificationConfig = (type) => {
		switch (type) {
			case 'Like':
				return {
					icon: 'bi-heart-fill',
					color: 'danger',
					title: 'New Like',
					text: 'liked your report',
				};
			case 'Comment':
				return {
					icon: 'bi-chat-dots-fill',
					color: 'primary',
					title: 'New Comment',
					text: 'commented on',
				};
			case 'Bookmark':
				return {
					icon: 'bi-bookmark-fill',
					color: 'info',
					title: 'Report Saved',
					text: 'saved your report',
				};
			case 'Join':
				return {
					icon: 'bi-person-plus-fill',
					color: 'success',
					title: 'New Volunteer',
					text: 'joined cleanup for',
				};
			default:
				return {
					icon: 'bi-bell-fill',
					color: 'secondary',
					title: 'Update',
					text: 'interacted with',
				};
		}
	};

	if (isLoading) {
		return (
			<div className='d-flex justify-content-center align-items-center vh-100'>
				<div className='spinner-border text-success' role='status' />
			</div>
		);
	}

	return (
		<section className='py-4 bg-light min-vh-100'>
			<div className='container'>
				{/* Header */}
				<div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3'>
					<div>
						<h2 className='fw-bold mb-1'>Notifications</h2>
						<p className='text-muted small mb-0'>History of all interactions with your reports.</p>
					</div>
					<Link to='/dashboard/' className='btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-sm'>
						<i className='bi bi-speedometer2 me-2'></i>Dashboard
					</Link>
				</div>

				{/* Notifications list */}
				{notifications.length > 0 ? (
					<>
						<div className='card border-0 shadow-sm rounded-4 overflow-hidden mb-4'>
							<div className='list-group list-group-flush'>
								{notifications.slice(0, visibleCount).map((n) => {
									const config = getNotificationConfig(n.type);
									return (
										<div key={n.id} className='list-group-item list-group-item-action p-4 border-0 border-bottom bg-white'>
											<div className='d-flex align-items-center'>
												{/* Dynamic icon */}
												<div
													className={`flex-shrink-0 bg-${config.color} bg-opacity-10 text-${config.color} rounded-circle d-flex align-items-center justify-content-center`}
													style={{ width: '50px', height: '50px' }}
												>
													<i className={`bi ${config.icon} fs-5`}></i>
												</div>

												<div className='ms-3 flex-grow-1'>
													<div className='d-flex justify-content-between align-items-center'>
														<h6 className='fw-bold mb-0'>{config.title}</h6>
														<small className='text-muted' style={{ fontSize: '11px' }}>
															{moment(n.date).fromNow()}
														</small>
													</div>

													<p className='mb-0 text-dark small mt-1'>
														<span className='fw-bold'>{n.sender?.full_name || 'Someone'}</span> {config.text}:
														{n.post ? (
															<Link to={`/${n.post.slug}/`} className='ms-1 fw-bold text-dark text-decoration-none'>
																"{n.post.title}"
															</Link>
														) : (
															<span className='ms-1 fw-bold text-dark'>"Deleted Report"</span>
														)}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* 'Load More' button */}
						{notifications.length > visibleCount && (
							<div className='text-center pb-5'>
								<button onClick={handleLoadMore} className='btn btn-success rounded-pill px-5 fw-bold shadow-sm' style={{ backgroundColor: '#22c55e', border: 'none' }}>
									Load More
								</button>
							</div>
						)}
					</>
				) : (
					<div className='text-center py-5 bg-white rounded-4 shadow-sm border mt-3'>
						<div className='mb-3 text-muted'>
							<i className='bi bi-bell-slash' style={{ fontSize: '4rem', opacity: '0.2' }}></i>
						</div>
						<h4 className='fw-bold text-muted'>No notifications yet</h4>
						<p className='text-muted small'>All updates about your reports will appear here.</p>
						<Link to='/dashboard/' className='btn btn-success mt-2 rounded-pill px-4'>
							Return to Dashboard
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

export default ViewAllNotifications;

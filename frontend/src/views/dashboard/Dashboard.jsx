import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userData from '../../plugins/userData';
import apiInstance from '../../utils/axios';
import moment from 'moment';
import Swal from 'sweetalert2';

function Dashboard() {
	const [stats, setStats] = useState({ views: 0, posts: 0, likes: 0, saved: 0 });
	const [posts, setPost] = useState([]);
	const [originalPosts, setOriginalPosts] = useState([]);
	const [comments, setComments] = useState([]);
	const [noti, setNoti] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	const user_id = userData()?.user_id;

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

	// Helper function to prevent layout breaking by long texts
	const truncateText = (text, maxLength) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};

	// Fetch dashboard data (stats, posts, comments, notifications)
	const fetchDashboardData = async () => {
		setIsLoading(true);
		try {
			const [stats_res, post_res, comment_res, noti_res] = await Promise.all([
				apiInstance.get(`dashboard/stats/${user_id}/`),
				apiInstance.get(`dashboard/post-list/${user_id}/`),
				apiInstance.get(`dashboard/comment-list/${user_id}/`),
				apiInstance.get(`dashboard/noti-list/${user_id}/`),
			]);

			setStats(stats_res?.data[0] || { views: 0, posts: 0, likes: 0, saved: 0 });
			setPost(post_res?.data || []);
			setOriginalPosts(post_res?.data || []);
			setComments(comment_res?.data || []);
			setNoti(noti_res.data || []);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		const filtered = originalPosts.filter((p) => p.title.toLowerCase().includes(term) || p.category?.title?.toLowerCase().includes(term));
		setPost(filtered);
	};

	// Handle post deletion with confirmation
	const handlePostDelete = async (postId) => {
		const result = await Swal.fire({
			title: 'Delete Report?',
			text: 'This action cannot be undone',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#6c757d',
			confirmButtonText: '<i class="bi bi-trash"></i> Delete',
		});

		if (result.isConfirmed) {
			try {
				await apiInstance.delete(`dashboard/post-detail/${user_id}/${postId}/`);
				Swal.fire({
					icon: 'success',
					title: 'Deleted',
					text: 'Report removed successfully',
					timer: 1500,
					showConfirmButton: false,
				});
				fetchDashboardData();
			} catch (error) {
				Swal.fire('Error', 'Something went wrong!', 'error');
			}
		}
	};

	// Handle sorting and filtering of reports
	const handleSortChange = (e) => {
		const sortValue = e.target.value;
		let sortedPosts = [...originalPosts];

		if (sortValue === 'Newest') {
			sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
		} else if (sortValue === 'Oldest') {
			sortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
		} else if (['Reported', 'Cleared', 'Scheduled'].includes(sortValue)) {
			sortedPosts = originalPosts.filter((p) => p.status === sortValue);
		}
		setPost(sortedPosts);
	};

	useEffect(() => {
		if (user_id) fetchDashboardData();
	}, [user_id]);

	// Show loading spinner while data is being fetched
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
				{/* Monitoring stats row */}
				<div className='row g-4 mb-4'>
					<InfoCard icon='bi-eye' color='success' value={stats?.views} label='Total Views' />
					<InfoCard icon='bi-megaphone' color='primary' value={stats?.posts} label='My Reports' />
					<InfoCard icon='bi-heart' color='danger' value={stats?.likes} label='Likes' />
					<InfoCard icon='bi-bookmark' color='info' value={stats?.bookmarks} label='Saved' />
				</div>

				{/* Activity overview row */}
				<div className='row g-4 mb-4'>
					{/* 'Your Reports' column */}
					<div className='col-md-6 col-xxl-4'>
						<div className='card border-0 shadow-sm h-100 rounded-4'>
							<div className='card-header bg-transparent border-bottom p-3 d-flex justify-content-between align-items-center'>
								<h5 className='mb-0 fw-bold' style={{ color: '#1a2d23' }}>
									Your Reports
								</h5>
								<i className='bi bi-grid-fill text-success' />
							</div>
							<div className='card-body p-3'>
								{posts.length > 0 ? (
									posts.slice(0, 3).map((p) => (
										<div key={p.id} className='d-flex align-items-center mb-3'>
											<img src={p?.image} className='rounded-3 shadow-sm' style={{ width: '80px', height: '80px', objectFit: 'cover' }} alt='' />
											<div className='ms-3'>
												<h6 className='mb-1 small fw-bold'>{truncateText(p?.title, 25)}</h6>
												<small className='text-muted d-block'>
													<i className='bi bi-calendar-event me-1'></i>
													{moment(p.date).format('DD MMM, YYYY')}
												</small>
												<small className='text-muted'>
													<i className='bi bi-eye me-1'></i>
													{p?.view || 0} views
												</small>
											</div>
										</div>
									))
								) : (
									<p className='text-center text-muted py-4 mb-0'>No reports</p>
								)}
							</div>
							{posts.length > 0 && (
								<div className='card-footer bg-transparent border-0 text-center pb-3 mt-auto'>
									<Link to='/dashboard/posts/' className='btn btn-link btn-sm text-success fw-bold text-decoration-none'>
										View all Reports
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Recent Comments column */}
					<div className='col-md-6 col-xxl-4'>
						<div className='card border-0 shadow-sm h-100 rounded-4'>
							<div className='card-header bg-transparent border-bottom p-3 d-flex justify-content-between align-items-center'>
								<h5 className='mb-0 fw-bold' style={{ color: '#1a2d23' }}>
									Recent Comments
								</h5>
								<i className='bi bi-chat-left-quote-fill text-primary' />
							</div>
							<div className='card-body p-3'>
								{comments.length > 0 ? (
									comments.slice(0, 3).map((c) => {
										const avatarUrl = c?.profile_image || c?.image;
										return (
											<div key={c.id} className='d-flex align-items-center mb-3'>
												<img
													src={getAvatar(avatarUrl)}
													className='rounded-circle border'
													style={{
														width: '50px',
														height: '50px',
														objectFit: 'cover',
														padding: avatarUrl ? '0' : '8px',
														backgroundColor: '#f8f9fa',
													}}
													alt=''
												/>
												<div className='ms-3'>
													<p className='mb-0 small fw-bold text-dark'>{truncateText(c?.comment, 40)}</p>
													<small className='text-muted'>by {c?.name}</small>
												</div>
											</div>
										);
									})
								) : (
									<p className='text-center text-muted py-4 mb-0'>No comments</p>
								)}
							</div>
							{comments.length > 0 && (
								<div className='card-footer bg-transparent border-0 text-center pb-3 mt-auto'>
									<Link to='/dashboard/comments/' className='btn btn-link btn-sm text-primary fw-bold text-decoration-none'>
										View all Comments
									</Link>
								</div>
							)}
						</div>
					</div>
					{/* Notifications column */}
					<div className='col-md-6 col-xxl-4'>
						<div className='card border-0 shadow-sm h-100 rounded-4'>
							<div className='card-header bg-transparent border-bottom p-3 d-flex justify-content-between align-items-center'>
								<h5 className='mb-0 fw-bold' style={{ color: '#1a2d23' }}>
									Notifications
								</h5>
								<i className='bi bi-bell-fill text-warning' />
							</div>
							<div className='card-body p-3'>
								{noti.length > 0 ? (
									noti.slice(0, 3).map((n) => (
										<div key={n.id} className='d-flex align-items-start mb-3 border-bottom pb-2'>
											<div className='icon-sm bg-light rounded-circle p-2 me-3'>
												{/* Icon based on notification type */}
												<i
													className={`bi ${
														n.type === 'Like'
															? 'bi-heart-fill text-danger'
															: n.type === 'Comment'
																? 'bi-chat-dots-fill text-primary'
																: n.type === 'Bookmark'
																	? 'bi-bookmark-fill text-info'
																	: n.type === 'Join'
																		? 'bi-person-plus-fill text-success'
																		: 'bi-bell-fill text-secondary'
													}`}
												/>
											</div>
											<div>
												<p className='mb-0 small text-dark'>
													<span className='fw-bold'>{n.sender?.full_name || 'Someone'}</span>
													{n.type === 'Like' && ` liked: `}
													{n.type === 'Comment' && ` commented on: `}
													{n.type === 'Bookmark' && ` saved: `}
													{n.type === 'Join' && ` joined event: `}
													<span className='text-muted fw-normal'>{truncateText(n.post?.title, 15)}</span>

													{/* Fallback for unknown notification types */}
													{!['Like', 'Comment', 'Bookmark', 'Join'].includes(n.type) && ` triggered a ${n.type}`}
												</p>
												{/* Relative timestamp */}
												<small className='text-muted'>{moment(n.date).fromNow()}</small>
											</div>
										</div>
									))
								) : (
									/* Empty state display */
									<p className='text-center text-muted py-4 mb-0'>No notifications</p>
								)}
							</div>
							{noti.length > 0 && (
								<div className='card-footer bg-transparent border-0 text-center pb-3 mt-auto'>
									<Link to='/dashboard/notifications/' className='btn btn-link btn-sm text-warning fw-bold text-decoration-none'>
										View all Notifications
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* 'All Your Reports' section */}
				<div className='card border-0 shadow-sm rounded-4'>
					<div className='card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center'>
						<div className='d-flex align-items-center'>
							<h4 className='mb-0 fw-bold' style={{ color: '#1a2d23' }}>
								All Your Reports
							</h4>
							<span className='badge rounded-pill bg-success bg-opacity-10 text-success ms-3 px-3 py-2 border border-success border-opacity-10' style={{ fontSize: '0.9rem' }}>
								{posts?.length || 0}
							</span>
						</div>
						<Link to='/dashboard/add-post/' className='btn btn-success btn-sm px-3 fw-bold shadow-sm' style={{ backgroundColor: '#22c55e', border: 'none' }}>
							<i className='bi bi-plus-lg me-2'></i>New Report
						</Link>
					</div>
					<div className='card-body p-4'>
						{/* Search and Sort */}
						<div className='row g-3 mb-4 justify-content-between'>
							<div className='col-md-6'>
								<div className='input-group shadow-sm rounded'>
									<span className='input-group-text bg-white border-end-0 text-muted'>
										<i className='bi bi-search' />
									</span>
									<input className='form-control border-start-0 bg-white' type='search' placeholder='Search reports...' value={searchTerm} onChange={handleSearch} />
								</div>
							</div>
							<div className='col-md-3'>
								<select onChange={handleSortChange} className='form-select bg-white shadow-sm'>
									<option value=''>Sort by</option>
									<option value='Newest'>Newest</option>
									<option value='Oldest'>Oldest</option>
									<option value='Reported'>Reported</option>
									<option value='Cleared'>Cleared</option>
								</select>
							</div>
						</div>

						<div className='table-responsive border-0'>
							<table className='table align-middle table-hover'>
								<thead className='table-dark' style={{ backgroundColor: '#1a2d23' }}>
									<tr>
										<th className='border-0 rounded-start ps-4'>Report Name</th>
										<th className='border-0'>Views</th>
										<th className='border-0'>Date</th>
										<th className='border-0'>Category</th>
										<th className='border-0'>Status</th>
										<th className='border-0 rounded-end'>Actions</th>
									</tr>
								</thead>
								<tbody>
									{/* Display reports or empty state */}
									{posts.length > 0 ? (
										posts.map((p) => (
											<tr key={p.id}>
												<td className='ps-4 fw-bold text-dark'>{truncateText(p?.title, 35)}</td>
												<td>{p?.view} Views</td>
												<td>{moment(p.date).format('DD MMM, YYYY')}</td>
												<td>
													<span className='badge bg-light text-dark border'>{p?.category?.title}</span>
												</td>
												<td>
													{/* Status badge with colour coding */}
													<span
														className={`badge ${
															p.status === 'Reported'
																? 'bg-danger'
																: p.status === 'Scheduled'
																	? 'bg-warning'
																	: p.status === 'Cleared'
																		? 'bg-success'
																		: p.status === 'Disabled'
																			? 'bg-dark'
																			: 'bg-secondary'
														} text-white`}
													>
														{p?.status}
													</span>
												</td>
												<td>
													{/* Edit and Delete buttons with icons */}
													<div className='d-flex gap-2'>
														<Link to={`/dashboard/edit-post/${p.id}/`} className='btn btn-outline-primary btn-sm rounded-circle' title='Edit'>
															<i className='bi bi-pencil-square' />
														</Link>
														<button onClick={() => handlePostDelete(p.id)} className='btn btn-outline-danger btn-sm rounded-circle' title='Delete'>
															<i className='bi bi-trash' />
														</button>
													</div>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan='6' className='text-center py-5 text-muted small'>
												No reports
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

{
	/* Reusable component for dashboard stats */
}
function InfoCard({ icon, color, value, label }) {
	return (
		<div className='col-sm-6 col-lg-3'>
			<div className='card border-0 shadow-sm rounded-4 p-3 h-100'>
				<div className='d-flex align-items-center'>
					<div className={`icon-xl fs-2 p-3 bg-${color} bg-opacity-10 rounded-3 text-${color} d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
						<i className={`bi ${icon}`} />
					</div>
					<div className='ms-3'>
						<h3 className='mb-0 fw-bold'>{value || 0}</h3>
						<p className='mb-0 text-muted small fw-semibold text-uppercase' style={{ letterSpacing: '0.5px' }}>
							{label}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;

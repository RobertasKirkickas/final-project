import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import apiInstance from '../../utils/axios';
import { useAuthStore } from '../../store/auth';
import Swal from 'sweetalert2';

function ViewAllReports() {
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Get logged-in user data
	const user = useAuthStore((state) => state.user);
	const userId = user().user_id;

	useEffect(() => {
		fetchUserReports();
	}, [userId]);

	// Fetch reports for the specific user
	const fetchUserReports = async () => {
		setIsLoading(true);
		try {
			const response = await apiInstance.get(`dashboard/post-list/${userId}/`);
			setPosts(response.data);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching dashboard reports:', error);
			setIsLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'Reported':
				return <span className='badge bg-danger rounded-pill'>Reported</span>;
			case 'Scheduled':
				return <span className='badge bg-warning text-dark rounded-pill'>Scheduled</span>;
			case 'Cleared':
				return <span className='badge bg-success rounded-pill'>Cleared</span>;
			default:
				return <span className='badge bg-secondary rounded-pill'>{status}</span>;
		}
	};

	// Handle post deletion with confirmation and list refresh
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
				await apiInstance.delete(`dashboard/post-detail/${userId}/${postId}/`);

				Swal.fire({
					icon: 'success',
					title: 'Deleted',
					text: 'Report removed successfully',
					timer: 1500,
					showConfirmButton: false,
				});

				// Refresh the list immediately after deletion
				fetchUserReports();
			} catch (error) {
				console.error('Delete error:', error);
				Swal.fire('Error', 'Something went wrong!', 'error');
			}
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
		<section className='py-4'>
			<div className='container'>
				{/* Header and action buttons */}
				<div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3'>
					<div>
						<h2 className='fw-bold mb-1'>My Litter Reports</h2>
						<p className='text-muted small mb-0'>Manage and track the status of your reported spots.</p>
					</div>
					<div className='d-flex gap-2'>
						{/* Back to Dashboard button */}
						<Link to='/dashboard/' className='btn btn-outline-secondary rounded-pill px-4 fw-bold'>
							<i className='bi bi-speedometer2 me-2'></i>Dashboard
						</Link>
						{/* 'New report' button */}
						<Link to='/dashboard/add-post/' className='btn btn-success rounded-pill px-4 fw-bold shadow-sm'>
							<i className='bi bi-plus-lg me-2'></i>Report New Spot
						</Link>
					</div>
				</div>

				{/* Reports list */}
				{posts.length > 0 ? (
					<div className='card border-0 shadow-sm rounded-4 overflow-hidden'>
						<div className='table-responsive'>
							<table className='table table-hover align-middle mb-0'>
								<thead className='bg-light'>
									<tr>
										<th className='border-0 px-4 py-3'>Report</th>
										<th className='border-0 py-3'>Status</th>
										<th className='border-0 py-3'>Date</th>
										<th className='border-0 py-3 text-center'>Stats</th>
										<th className='border-0 px-4 py-3 text-end'>Actions</th>
									</tr>
								</thead>
								<tbody>
									{posts.map((p) => (
										<tr key={p.id}>
											<td className='px-4 py-3'>
												<div className='d-flex align-items-center'>
													<Link to={`/${p.slug}/`}>
														<img src={p.image} className='rounded-3 me-3' style={{ width: '50px', height: '50px', objectFit: 'cover' }} alt={p.title} />
													</Link>
													<div>
														<Link to={`/${p.slug}/`} className='text-dark fw-bold text-decoration-none d-block'>
															{p.title.length > 35 ? p.title.substring(0, 35) + '...' : p.title}
														</Link>
														<span className='text-muted extra-small' style={{ fontSize: '11px' }}>
															{p.category?.title || 'No Category'}
														</span>
													</div>
												</div>
											</td>
											<td>{getStatusBadge(p.status)}</td>
											<td className='text-muted small'>{moment(p.date).format('MMM DD, YYYY')}</td>
											<td className='text-center'>
												<div className='d-flex justify-content-center gap-3 text-muted small'>
													<span>
														<i className='bi bi-hand-thumbs-up me-1'></i>
														{p.likes?.length || 0}
													</span>
													<span>
														<i className='bi bi-eye me-1'></i>
														{p.view || 0}
													</span>
												</div>
											</td>
											<td className='px-4 text-end'>
												<div className='btn-group'>
													<Link to={`/dashboard/edit-post/${p.id}/`} className='btn btn-outline-primary btn-sm rounded-pill px-3 me-2'>
														<i className='bi bi-pencil-square me-1'></i> Edit
													</Link>
													<button onClick={() => handlePostDelete(p.id)} className='btn btn-outline-danger btn-sm rounded-circle' title='Delete'>
														<i className='bi bi-trash' />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className='text-center py-5 bg-white rounded-4 shadow-sm'>
						<i className='bi bi-file-earmark-plus text-muted display-1'></i>
						<h4 className='fw-bold mt-3'>No reports</h4>
						<p className='text-muted'>You haven't reported any litter spots yet.</p>
						<Link to='/dashboard/add-post/' className='btn btn-success mt-2 rounded-pill px-4'>
							Submit a Report
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

export default ViewAllReports;

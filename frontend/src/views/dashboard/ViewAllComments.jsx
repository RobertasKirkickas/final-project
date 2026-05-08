import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import apiInstance from '../../utils/axios';
import { useAuthStore } from '../../store/auth';
import Swal from 'sweetalert2';

function ViewAllComments() {
	const [comments, setComments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeReplyId, setActiveReplyId] = useState(null);
	const [replyText, setReplyText] = useState('');

	// Get logged-in user data
	const user = useAuthStore((state) => state.user);
	const userId = user()?.user_id;
	const username = user()?.username;

	// Helper function to prevent layout breaking by long texts
	const truncateText = (text, maxLength) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};

	useEffect(() => {
		if (userId) {
			fetchUserComments();
		}
	}, [userId]);

	const fetchUserComments = async () => {
		setIsLoading(true);
		try {
			const response = await apiInstance.get(`dashboard/comment-list/${userId}/`);
			setComments(response.data || []);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching comments:', error);
			setIsLoading(false);
		}
	};

	const handleReplySubmit = async (commentId) => {
		if (!replyText.trim()) return;

		try {
			await apiInstance.post(`dashboard/reply-comment/`, {
				comment_id: commentId,
				reply: replyText,
			});

			Swal.fire({ icon: 'success', title: 'Reply Sent', timer: 1500, showConfirmButton: false });
			setReplyText('');
			setActiveReplyId(null);
			fetchUserComments(); // Refresh list
		} catch (error) {
			Swal.fire('Error', 'Could not send reply', 'error');
		}
	};

	const handleCommentDelete = async (commentId) => {
		const result = await Swal.fire({
			title: 'Delete Comment?',
			text: 'This action cannot be undone',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			confirmButtonText: 'Delete',
		});

		if (result.isConfirmed) {
			try {
				await apiInstance.delete(`dashboard/comment-delete/${userId}/${commentId}/`);
				Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
				fetchUserComments();
			} catch (error) {
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
				{/* Header */}
				<div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3'>
					<div>
						<h2 className='fw-bold mb-1'>All Comments</h2>
						<p className='text-muted small mb-0'>Manage your discussions on various litter reports.</p>
					</div>
					<Link to='/dashboard/' className='btn btn-outline-secondary rounded-pill px-4 fw-bold'>
						<i className='bi bi-speedometer2 me-2'></i>Dashboard
					</Link>
				</div>

				{comments.length > 0 ? (
					<div className='card border-0 shadow-sm rounded-4 overflow-hidden'>
						<div className='table-responsive'>
							<table className='table table-hover align-middle mb-0'>
								<thead className='bg-light'>
									<tr>
										<th className='border-0 px-4 py-3'>Report Title</th>
										<th className='border-0 py-3'>Comment Thread</th>
										<th className='border-0 py-3 text-center'>Date</th>
										<th className='border-0 px-4 py-3 text-end'>Actions</th>
									</tr>
								</thead>
								<tbody>
									{comments.map((c) => (
										<React.Fragment key={c.id}>
											<tr>
												<td className='px-4 py-3'>
													{c.post ? (
														<Link to={`/${c.post.slug}/`} className='text-dark fw-bold text-decoration-none'>
															{truncateText(c.post.title, 15)}
														</Link>
													) : (
														<span className='text-muted small italic'>Report deleted</span>
													)}
												</td>
												<td className='py-3'>
													<div className='mb-1'>
														<small className='text-success fw-bold'>Comment by {c.name || 'User'}:</small>
													</div>
													<p className='mb-2 text-dark small' style={{ maxWidth: '350px' }}>
														{c.comment}
													</p>
													{c.reply && (
														<div className='p-2 bg-light border-start border-success border-3 rounded-1 mt-2'>
															<small className='text-muted d-block fw-bold mb-1'>Your Response:</small>
															<p className='mb-0 text-muted small italic'>{c.reply}</p>
														</div>
													)}
												</td>
												<td className='text-muted small text-center'>{moment(c.date).format('MMM DD, YYYY')}</td>
												<td className='px-4 text-end'>
													<div className='d-flex justify-content-end gap-2'>
														<button
															onClick={() => {
																setActiveReplyId(activeReplyId === c.id ? null : c.id);
																setReplyText('');
															}}
															className='btn btn-outline-success btn-sm rounded-pill px-3'
														>
															<i className='bi bi-reply-fill'></i> Reply
														</button>
														<button onClick={() => handleCommentDelete(c.id)} className='btn btn-outline-danger btn-sm rounded-circle'>
															<i className='bi bi-trash' />
														</button>
													</div>
												</td>
											</tr>

											{/* Inline reply to comment */}
											{activeReplyId === c.id && (
												<tr className='bg-light'>
													<td colSpan='4' className='px-4 py-3'>
														<div className='d-flex gap-2 shadow-sm p-2 bg-white rounded-pill'>
															<input
																type='text'
																className='form-control form-control-sm border-0 bg-transparent'
																placeholder='Write a response...'
																value={replyText}
																onChange={(e) => setReplyText(e.target.value)}
															/>
															<button onClick={() => handleReplySubmit(c.id)} className='btn btn-success btn-sm rounded-pill px-4'>
																Send
															</button>
														</div>
													</td>
												</tr>
											)}
										</React.Fragment>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className='text-center py-5 bg-white rounded-4 shadow-sm'>
						<i className='bi bi-chat-left-text text-muted display-1'></i>
						<h4 className='fw-bold mt-3'>No comments</h4>
						<Link to='/' className='btn btn-success mt-2 rounded-pill px-4'>
							Browse Reports
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

export default ViewAllComments;

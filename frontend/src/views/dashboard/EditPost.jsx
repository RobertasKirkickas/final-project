import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiInstance from '../../utils/axios';
import userData from '../../plugins/userData';
import Toast from '../../plugins/Toast';
import Swal from 'sweetalert2';

function EditPost() {
	const [post, setEditPost] = useState({
		title: '',
		description: '',
		category: '',
		tags: '',
		status: '',
		scheduled_date: '',
		scheduled_time: '',
	});

	const [images, setImages] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);

	const { id } = useParams();
	const user_id = userData()?.user_id;
	const navigate = useNavigate();

	// Fetch categories and post details on component mount
	useEffect(() => {
		if (user_id && id) {
			const fetchData = async () => {
				try {
					const catRes = await apiInstance.get('post/category/list/');
					setCategoryList(catRes.data);

					const postRes = await apiInstance.get(`dashboard/post-detail/${user_id}/${id}/`);

					const categoryId = postRes.data.category?.id || postRes.data.category;

					// Pre-fill form with existing post data
					setEditPost({
						title: postRes.data.title || '',
						description: postRes.data.description || '',
						category: categoryId || '',
						tags: postRes.data.tags || '',
						status: postRes.data.status || 'Reported',
						scheduled_date: postRes.data.scheduled_date || '',
						scheduled_time: postRes.data.scheduled_time || '',
					});

					// Handle existing image (if any)
					if (postRes.data.image) {
						setImages([{ preview: postRes.data.image, isExisting: true }]);
					}
					setIsFetching(false);
				} catch (error) {
					console.error('Fetch Error:', error);
					Toast('error', 'Could not load report data.');
					setIsFetching(false);
				}
			};
			fetchData();
		}
	}, [id, user_id]);

	// Form field changes
	const handleEditPostChange = (event) => {
		setEditPost({ ...post, [event.target.name]: event.target.value });
	};

	// Image file selection
	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files);
		if (images.length + selectedFiles.length > 5) {
			Toast('error', 'Maximum 5 images allowed');
			return;
		}
		// Create preview URLs for new images
		const newImages = selectedFiles.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
		}));
		setImages([...images, ...newImages]);
	};

	const removeImage = (index) => {
		setImages(images.filter((_, i) => i !== index));
	};

	// Form submission for updating the post
	const handleUpdatePost = async (event) => {
		event.preventDefault();
		setIsLoading(true);

		const formData = new FormData();
		formData.append('user_id', user_id);
		formData.append('title', post.title);
		formData.append('description', post.description);
		formData.append('tags', post.tags);
		formData.append('category', post.category);
		formData.append('post_status', post.status);
		formData.append('scheduled_date', post.scheduled_date);
		formData.append('scheduled_time', post.scheduled_time);

		images.forEach((img, index) => {
			if (img.file) {
				formData.append(index === 0 ? 'image' : `image_${index}`, img.file);
			}
		});

		// Submit the form data to the backend
		try {
			await apiInstance.patch(`dashboard/post-detail/${user_id}/${id}/`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setIsLoading(false);
			Swal.fire({ icon: 'success', title: 'Report Updated!', confirmButtonColor: '#22c55e' });
			navigate('/dashboard/');
		} catch (error) {
			setIsLoading(false);
			Toast('error', 'Update failed.');
		}
	};

	// Loading state while fetching post data
	if (isFetching) {
		return (
			<div className='d-flex flex-column align-items-center justify-content-center' style={{ minHeight: '80vh' }}>
				<div className='spinner-border text-success mb-3' role='status' style={{ width: '3rem', height: '3rem' }}>
					<span className='visually-hidden'>Loading...</span>
				</div>
				<h4 className='text-muted fw-light'>Loading report data...</h4>
			</div>
		);
	}

	return (
		<section className='py-5 bg-light min-vh-100'>
			<div className='container'>
				<div className='row justify-content-center'>
					<div className='col-lg-10'>
						{/* Hero header */}
						<div className='card border-0 shadow-sm rounded-4 mb-4' style={{ backgroundColor: '#1a2d23' }}>
							<div className='card-body p-4 p-lg-5 text-white d-flex justify-content-between align-items-center'>
								<div>
									<h1 className='h2 fw-bold mb-2'>Edit Report</h1>
									<p className='opacity-75 mb-0'>Update the details of your litter report.</p>
								</div>
								<Link to='/dashboard/' className='btn btn-light rounded-pill px-4 fw-bold'>
									Cancel
								</Link>
							</div>
						</div>

						{/* Edit form */}
						<form onSubmit={handleUpdatePost}>
							<div className='row g-4'>
								<div className='col-md-5'>
									<div className='card border-0 shadow-sm rounded-4 p-4'>
										<h5 className='fw-bold mb-3'>Photos</h5>
										<div className='row g-2'>
											{images.map((img, index) => (
												<div key={index} className='col-4 position-relative'>
													<img src={img.preview} className='rounded-3 w-100' style={{ height: '90px', objectFit: 'cover' }} alt='' />
													<button
														type='button'
														onClick={() => removeImage(index)}
														className='btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center'
														style={{ width: '22px', height: '22px', marginTop: '-5px', marginRight: '-5px' }}
													>
														<i className='bi bi-x'></i>
													</button>
												</div>
											))}
											{images.length < 5 && (
												<div className='col-4'>
													<label className='d-flex align-items-center justify-content-center border border-2 border-dashed rounded-3 w-100' style={{ height: '90px', cursor: 'pointer' }}>
														<input type='file' className='d-none' onChange={handleFileChange} multiple accept='image/*' />
														<i className='bi bi-plus-lg fs-3 text-muted'></i>
													</label>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Form details section */}
								<div className='col-md-7'>
									<div className='card border-0 shadow-sm rounded-4 p-4'>
										<div className='mb-3'>
											<label className='form-label fw-bold small text-uppercase text-muted'>Location / Title</label>
											<input className='form-control form-control-lg' name='title' value={post.title} onChange={handleEditPostChange} type='text' required />
										</div>

										<div className='row'>
											<div className='col-md-6 mb-3'>
												<label className='form-label fw-bold small text-uppercase text-muted'>Area</label>
												<select className='form-select' name='category' value={post.category} onChange={handleEditPostChange} required>
													<option value=''>Select Category</option>
													{categoryList.map((c) => (
														<option key={c.id} value={c.id}>
															{c.title}
														</option>
													))}
												</select>
											</div>
											<div className='col-md-6 mb-3'>
												<label className='form-label fw-bold small text-uppercase text-muted'>Status</label>
												<select className='form-select fw-bold text-success' name='status' value={post.status} onChange={handleEditPostChange}>
													<option value='Reported'>Reported</option>
													<option value='Scheduled'>Scheduled</option>
													<option value='Cleared'>Cleared</option>
													<option value='Disabled'>Disabled</option>
												</select>
											</div>
										</div>

										<div className='row'>
											<div className='col-md-6 mb-3'>
												<label className='form-label fw-bold small text-uppercase text-muted'>Cleanup Date</label>
												<input type='date' name='scheduled_date' className='form-control' value={post.scheduled_date} onChange={handleEditPostChange} />
											</div>
											<div className='col-md-6 mb-3'>
												<label className='form-label fw-bold small text-uppercase text-muted'>Cleanup Time</label>
												<input type='time' name='scheduled_time' className='form-control' value={post.scheduled_time} onChange={handleEditPostChange} />
											</div>
										</div>

										<div className='mb-4'>
											<label className='form-label fw-bold small text-uppercase text-muted'>Description</label>
											<textarea name='description' value={post.description} onChange={handleEditPostChange} className='form-control' rows='4' required></textarea>
										</div>

										<button className='btn btn-success btn-lg w-100 fw-bold py-3 shadow-sm' type='submit' disabled={isLoading}>
											{isLoading ? 'Saving Changes...' : 'Save Changes'}
										</button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}

export default EditPost;

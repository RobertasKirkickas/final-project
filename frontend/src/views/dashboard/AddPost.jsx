import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiInstance from '../../utils/axios';
import userData from '../../plugins/userData';
import Toast from '../../plugins/Toast';
import Swal from 'sweetalert2';

function AddPost() {
	const [post, setCreatePost] = useState({
		title: '',
		description: '',
		category: '',
		tags: '',
		status: 'Reported',
		scheduled_date: '',
		scheduled_time: '',
	});

	const [images, setImages] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const user_id = userData()?.user_id;
	const navigate = useNavigate();

	const fetchCategory = async () => {
		try {
			const response = await apiInstance.get('post/category/list/');
			setCategoryList(response.data);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	// Fetch categories on component mount
	useEffect(() => {
		fetchCategory();
	}, []);

	// Form field changes
	const handleCreatePostChange = (event) => {
		setCreatePost({
			...post,
			[event.target.name]: event.target.value,
		});
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

	// Form submission for creating a new report
	const handleCreatePost = async (event) => {
		event.preventDefault();
		setIsLoading(true);

		if (!post.title || !post.description || images.length === 0 || !post.category) {
			Toast('error', 'Please complete all required fields and add at least one photo.');
			setIsLoading(false);
			return;
		}

		// Prepare form data for submission
		const formData = new FormData();
		formData.append('user_id', user_id);
		formData.append('title', post.title);
		formData.append('description', post.description);
		formData.append('tags', post.tags);
		formData.append('category', post.category);
		formData.append('status', post.status);
		formData.append('scheduled_date', post.scheduled_date);
		formData.append('scheduled_time', post.scheduled_time);

		// Append images to formData
		images.forEach((img, index) => {
			if (index === 0) {
				formData.append('image', img.file); // Main image
			} else {
				formData.append(`image_${index}`, img.file); // Extra images
			}
		});

		// Submit the form data to the backend
		try {
			await apiInstance.post('dashboard/post-create/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			setIsLoading(false);
			Swal.fire({
				icon: 'success',
				title: 'Report Submitted',
				text: 'The litter report has been successfully logged.',
				confirmButtonColor: '#22c55e',
			});
			navigate('/dashboard/');
		} catch (error) {
			console.error('Submission error:', error);
			Toast('error', 'Failed to submit report. Please contact support.');
			setIsLoading(false);
		}
	};

	return (
		<section className='py-5 bg-light min-vh-100'>
			<div className='container'>
				<div className='row justify-content-center'>
					<div className='col-lg-10'>
						{/* Hero header */}
						<div className='card border-0 shadow-sm rounded-4 mb-4' style={{ backgroundColor: '#1a2d23' }}>
							<div className='card-body p-4 p-lg-5 text-white'>
								<div className='d-flex align-items-center justify-content-between'>
									<div>
										<h1 className='h2 fw-bold mb-2'>Report Litter Location</h1>
										<p className='opacity-75 mb-0'>Submit a new report to help keep Ipswich clean.</p>
									</div>
									<Link to='/dashboard/' className='btn btn-light rounded-pill px-4 fw-bold'>
										<i className='bi bi-arrow-left me-2'></i>Dashboard
									</Link>
								</div>
							</div>
						</div>

						<form onSubmit={handleCreatePost}>
							<div className='row g-4'>
								{/* Photo upload section */}
								<div className='col-md-5'>
									<div className='card border-0 shadow-sm rounded-4 h-100'>
										<div className='card-header bg-transparent border-bottom p-4'>
											<h5 className='mb-0 fw-bold'>Evidence Photos</h5>
											<small className='text-muted'>Upload up to 5 clear images.</small>
										</div>
										<div className='card-body p-4'>
											<div className='row g-2 mb-3'>
												{images.map((img, index) => (
													<div key={index} className='col-4 position-relative'>
														<img src={img.preview} className='rounded-3 w-100 shadow-sm' style={{ height: '90px', objectFit: 'cover' }} alt='' />
														<button
															type='button'
															onClick={() => removeImage(index)}
															className='btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center'
															style={{ width: '22px', height: '22px', marginTop: '-5px', marginRight: '-5px' }}
														>
															<i className='bi bi-x' style={{ fontSize: '12px' }}></i>
														</button>
													</div>
												))}
												{images.length < 5 && (
													<div className='col-4'>
														<label
															className='d-flex align-items-center justify-content-center border border-2 border-dashed rounded-3 w-100'
															style={{ height: '90px', cursor: 'pointer', backgroundColor: '#f8f9fa' }}
														>
															<input type='file' className='d-none' onChange={handleFileChange} multiple accept='image/*' />
															<i className='bi bi-plus-lg text-muted fs-3'></i>
														</label>
													</div>
												)}
											</div>

											{images.length === 0 && (
												<div className='text-center py-5 border rounded-4 bg-light bg-opacity-50 border-dashed'>
													<i className='bi bi-camera fs-1 text-success opacity-25'></i>
													<p className='small text-muted mt-2'>Select photos to begin</p>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Form details section */}
								<div className='col-md-7'>
									<div className='card border-0 shadow-sm rounded-4'>
										<div className='card-header bg-transparent border-bottom p-4'>
											<h5 className='mb-0 fw-bold'>Report Details</h5>
										</div>
										<div className='card-body p-4'>
											<div className='mb-3'>
												<label className='form-label fw-bold small text-muted text-uppercase'>Location / Title</label>
												<input className='form-control form-control-lg' name='title' onChange={handleCreatePostChange} type='text' placeholder='Where is the litter?' required />
											</div>

											<div className='mb-3'>
												<label className='form-label fw-bold small text-muted text-uppercase'>Area</label>
												<select className='form-select' name='category' onChange={handleCreatePostChange} required>
													<option value=''>Please select</option>
													{categoryList.map((c) => (
														<option key={c.id} value={c.id}>
															{c.title}
														</option>
													))}
												</select>
											</div>

											{/* Timeslot section */}
											<div className='row'>
												<div className='col-md-6 mb-3'>
													<label className='form-label fw-bold small text-muted text-uppercase'>Suggested Cleanup Date</label>
													<input type='date' name='scheduled_date' className='form-control' onChange={handleCreatePostChange} />
												</div>
												<div className='col-md-6 mb-3'>
													<label className='form-label fw-bold small text-muted text-uppercase'>Best Time</label>
													<input type='time' name='scheduled_time' className='form-control' onChange={handleCreatePostChange} />
												</div>
											</div>

											<div className='mb-3'>
												<label className='form-label fw-bold small text-muted text-uppercase'>Description</label>
												<textarea name='description' onChange={handleCreatePostChange} className='form-control' rows='4' placeholder='Provide more details...' required></textarea>
											</div>

											<div className='mb-3'>
												<label className='form-label fw-bold small text-muted text-uppercase'>Tags</label>
												<input name='tags' onChange={handleCreatePostChange} className='form-control' type='text' placeholder='e.g. plastic, hazardous' />
											</div>

											<button className='btn btn-success btn-lg w-100 mt-2 fw-bold py-3 rounded-3' type='submit' disabled={isLoading} style={{ backgroundColor: '#22c55e', border: 'none' }}>
												{isLoading ? (
													<span>
														<i className='fas fa-spinner fa-spin me-2'></i>Uploading...
													</span>
												) : (
													<span>
														Submit Litter Report <i className='bi bi-send-fill ms-2'></i>
													</span>
												)}
											</button>
										</div>
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

export default AddPost;

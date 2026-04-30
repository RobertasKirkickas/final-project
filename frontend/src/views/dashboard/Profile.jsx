import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiInstance from '../../utils/axios';
import userData from '../../plugins/userData';
import Toast from '../../plugins/Toast';
import CreatePassword from '../auth/CreatePassword';

function Profile() {
	const [profileData, setProfileData] = useState({
		image: null,
		full_name: '',
		bio: '',
		facebook: '',
	});

	const [imagePreview, setImagePreview] = useState('');
	const [loading, setLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);

	const user_id = userData()?.user_id;
	const defaultAvatar = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/solid/user.svg';

	// Fetch profile data on mount
	useEffect(() => {
		if (user_id) {
			fetchProfile();
		}
	}, [user_id]);

	// Fetch profile data from backend
	const fetchProfile = async () => {
		try {
			const res = await apiInstance.get(`user/profile/${user_id}/`);
			setProfileData({
				image: res.data.image,
				full_name: res.data.full_name || '',
				bio: res.data.bio || '',
				facebook: res.data.facebook || '',
			});
			setIsFetching(false);
		} catch (error) {
			Toast('error', 'Failed to load profile');
			setIsFetching(false);
		}
	};

	const handleProfileChange = (event) => {
		setProfileData({ ...profileData, [event.target.name]: event.target.value });
	};

	// Handle file input change for avatar
	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		setProfileData({ ...profileData, image: selectedFile });

		const reader = new FileReader();
		reader.onloadend = () => setImagePreview(reader.result);
		if (selectedFile) reader.readAsDataURL(selectedFile);
	};

	// Clear avatar and show default
	const removeAvatar = () => {
		setProfileData({ ...profileData, image: 'delete' });
		setImagePreview(defaultAvatar);
	};

	// Profile form submission
	const handleProfileSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData();
		// If avatar is marked for deletion, send empty string to backend
		if (profileData.image === 'delete') {
			formData.append('image', '');
		} else if (profileData.image && typeof profileData.image !== 'string') {
			formData.append('image', profileData.image);
		}

		formData.append('full_name', profileData.full_name);
		formData.append('bio', profileData.bio);
		formData.append('facebook', profileData.facebook);

		// API call to update profile
		try {
			await apiInstance.patch(`user/profile/${user_id}/`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			Toast('success', 'Profile updated successfully');
			setImagePreview(''); // Reset preview state after success
			fetchProfile();
		} catch (error) {
			Toast('error', 'Update failed');
		} finally {
			setLoading(false);
		}
	};

	if (isFetching) {
		return (
			<div className='d-flex align-items-center justify-content-center' style={{ minHeight: '80vh' }}>
				<div className='spinner-border text-success' role='status'></div>
			</div>
		);
	}

	return (
		<section className='py-5 bg-light min-vh-100'>
			<div className='container'>
				<div className='row justify-content-center'>
					<div className='col-lg-10'>
						{/* Hero Header */}
						<div className='card border-0 shadow-sm rounded-4 mb-4' style={{ backgroundColor: '#1a2d23' }}>
							<div className='card-body p-4 p-lg-5 text-white d-flex justify-content-between align-items-center'>
								<div>
									<h1 className='h2 fw-bold mb-2'>Account Settings</h1>
									<p className='opacity-75 mb-0'>Personalise your profile and manage your security.</p>
								</div>
								<Link to='/dashboard/' className='btn btn-light rounded-pill px-4 fw-bold'>
									Back to Dashboard
								</Link>
							</div>
						</div>

						{/* Profile details form */}
						<form onSubmit={handleProfileSubmit} className='mb-5'>
							<div className='row g-4'>
								<div className='col-md-4'>
									<div className='card border-0 shadow-sm rounded-4 p-4 text-center'>
										<h5 className='fw-bold mb-4'>Profile Picture</h5>
										<div className='position-relative d-inline-block mb-3'>
											<img
												src={imagePreview || profileData?.image || defaultAvatar}
												className='rounded-circle shadow-sm border border-4 border-white'
												alt='Profile'
												style={{ width: '160px', height: '160px', objectFit: 'cover' }}
											/>
											{/* Bin icon to remove avatar */}
											{((profileData.image && profileData.image !== 'delete') || imagePreview) && (
												<button type='button' onClick={removeAvatar} className='btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle' title='Remove Image'>
													<i className='bi bi-trash'></i>
												</button>
											)}
										</div>
										<div className='d-grid gap-2'>
											<label className='btn btn-outline-success btn-sm rounded-pill px-4'>
												Change Photo
												<input type='file' name='image' className='d-none' onChange={handleFileChange} />
											</label>
										</div>
									</div>
								</div>

								<div className='col-md-8'>
									<div className='card border-0 shadow-sm rounded-4 p-4 p-lg-5'>
										<h5 className='fw-bold mb-4 text-success'>Personal Details</h5>
										<div className='row g-3'>
											<div className='col-12'>
												<label className='form-label small fw-bold text-muted text-uppercase'>Full Name</label>
												<input type='text' className='form-control form-control-lg bg-light border-0' name='full_name' value={profileData.full_name} onChange={handleProfileChange} />
											</div>
											<div className='col-12'>
												<label className='form-label small fw-bold text-muted text-uppercase'>Facebook URL</label>
												<input type='text' className='form-control bg-light border-0' name='facebook' value={profileData.facebook} onChange={handleProfileChange} />
											</div>
											<div className='col-12'>
												<label className='form-label small fw-bold text-muted text-uppercase'>About Me</label>
												<textarea
													className='form-control bg-light border-0'
													name='bio'
													rows='4'
													value={profileData.bio}
													onChange={handleProfileChange}
													placeholder='Tell us about yourself...'
												></textarea>
											</div>
											<div className='col-12 mt-4'>
												<button className='btn btn-success btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm' type='submit' disabled={loading}>
													{loading ? 'Saving Changes...' : 'Save Profile Changes'}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</form>

						{/* Password Section */}
						<div className='row justify-content-end'>
							<div className='col-md-8'>
								<CreatePassword />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Profile;

import React, { useState } from 'react';
import apiInstance from '../../utils/axios';
import userData from '../../plugins/userData';
import Toast from '../../plugins/Toast';

function CreatePassword() {
	const [passwordData, setPasswordData] = useState({
		current_password: '',
		new_password: '',
		confirm_new_password: '',
	});
	const [loading, setLoading] = useState(false);
	const user_id = userData()?.user_id;

	const handlePasswordChange = (event) => {
		setPasswordData({ ...passwordData, [event.target.name]: event.target.value });
	};

	// Form submission
	const handlePasswordSubmit = async (e) => {
		e.preventDefault();

		// Check if new passwords match
		if (passwordData.new_password !== passwordData.confirm_new_password) {
			Toast('error', 'New passwords do not match');
			return;
		}

		setLoading(true);
		try {
			await apiInstance.post(`user/change-password/${user_id}/`, {
				current_password: passwordData.current_password,
				new_password: passwordData.new_password,
			});

			Toast('success', 'Password updated successfully');
			// Reset form fields after success
			setPasswordData({ current_password: '', new_password: '', confirm_new_password: '' });
		} catch (error) {
			Toast('error', error.response?.data?.message || 'Password change failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='card border-0 shadow-sm rounded-4 p-4 p-lg-5'>
			<h5 className='fw-bold mb-4 text-primary'>Change your password</h5>
			<form onSubmit={handlePasswordSubmit}>
				<div className='row g-3'>
					<div className='col-12'>
						<label className='form-label small fw-bold text-muted text-uppercase'>Current Password</label>
						<input type='password' className='form-control bg-light border-0' name='current_password' value={passwordData.current_password} onChange={handlePasswordChange} required />
					</div>
					<div className='col-md-6'>
						<label className='form-label small fw-bold text-muted text-uppercase'>New Password</label>
						<input type='password' className='form-control bg-light border-0' name='new_password' value={passwordData.new_password} onChange={handlePasswordChange} required />
					</div>
					<div className='col-md-6'>
						<label className='form-label small fw-bold text-muted text-uppercase'>Confirm New Password</label>
						<input type='password' className='form-control bg-light border-0' name='confirm_new_password' value={passwordData.confirm_new_password} onChange={handlePasswordChange} required />
					</div>
					<div className='col-12 mt-4'>
						<button className='btn btn-primary btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm' type='submit' disabled={loading}>
							{loading ? 'Updating Password...' : 'Update Password'}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

export default CreatePassword;

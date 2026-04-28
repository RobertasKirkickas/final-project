import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { register } from '../../utils/auth';

function Register() {
	const [bioData, setBioData] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);

	const allUserData = useAuthStore((state) => state.allUserData);
	const navigate = useNavigate();

	useEffect(() => {
		if (allUserData !== null) {
			navigate('/dashboard/');
		}
	}, [allUserData, navigate]);

	const handleBioDataChange = (event) => {
		setBioData({
			...bioData,
			[event.target.name]: event.target.value,
		});
		if (errorMsg) setErrorMsg(null);
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMsg(null);

		// Check if passwords match
		if (bioData.password !== bioData.confirmPassword) {
			setErrorMsg('Passwords do not match!');
			setIsLoading(false);
			return;
		}

		const { error } = await register(bioData.full_name, bioData.email, bioData.password, bioData.confirmPassword);

		if (error) {
			if (typeof error === 'object') {
				// Extracting the first error message from the error object
				const errorMessage = Object.values(error)[0][0];
				setErrorMsg(errorMessage);
			} else {
				setErrorMsg(error);
			}
			setBioData({ ...bioData, password: '', confirmPassword: '' });
		} else {
			navigate('/login/');
		}
		setIsLoading(false);
	};

	return (
		<section className='container py-4 py-md-5 mt-4 mt-md-5'>
			<div className='row align-items-center justify-content-center'>
				<div className='col-lg-5 col-md-8'>
					<div className='card shadow-lg border-0'>
						<div className='card-body p-4 p-md-5'>
							<div className='mb-4 text-center'>
								<h1 className='mb-1 fw-bold' style={{ color: '#1a2d23' }}>
									Create an Account
								</h1>
								<p className='text-muted small'>Register now to start reporting litter.</p>
							</div>

							{errorMsg && (
								<div className='alert alert-danger py-2 small border-0 mb-4 d-flex align-items-center' role='alert'>
									<i className='bi bi-exclamation-triangle-fill me-2'></i>
									{errorMsg}
								</div>
							)}

							<form onSubmit={handleRegister}>
								{/* Full Name */}
								<div className='mb-3'>
									<label className='form-label fw-semibold small text-muted text-uppercase'>Full Name</label>
									<input type='text' className='form-control py-2' name='full_name' placeholder='John Doe' value={bioData.full_name} onChange={handleBioDataChange} required />
								</div>

								{/* Email Address */}
								<div className='mb-3'>
									<label className='form-label fw-semibold small text-muted text-uppercase'>Email Address</label>
									<input type='email' className='form-control py-2' name='email' placeholder='john@example.com' value={bioData.email} onChange={handleBioDataChange} required />
								</div>

								{/* Password */}
								<div className='mb-3'>
									<label className='form-label fw-semibold small text-muted text-uppercase'>Password</label>
									<input type='password' className='form-control py-2' name='password' placeholder='********' value={bioData.password} onChange={handleBioDataChange} required />
								</div>

								{/* Confirm Password */}
								<div className='mb-4'>
									<label className='form-label fw-semibold small text-muted text-uppercase'>Confirm Password</label>
									<input type='password' className='form-control py-2' name='confirmPassword' placeholder='********' value={bioData.confirmPassword} onChange={handleBioDataChange} required />
								</div>

								<div className='d-grid'>
									<button className='btn btn-success py-2 fw-bold text-white' type='submit' disabled={isLoading} style={{ backgroundColor: '#22c55e', border: 'none' }}>
										{isLoading ? 'Processing...' : 'Register Now'}
									</button>
								</div>
							</form>

							<div className='mt-4 text-center'>
								<span className='small text-muted'>Already have an account? </span>
								<Link to='/login/' className='small text-success fw-bold text-decoration-none'>
									Login
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Register;

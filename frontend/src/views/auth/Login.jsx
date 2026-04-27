import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { login } from '../../utils/auth';

function Login() {
	const [bioData, setBioData] = useState({ email: '', password: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);

	const allUserData = useAuthStore((state) => state.allUserData);
	const navigate = useNavigate();

	// Redirect user if they are already logged in
	useEffect(() => {
		if (allUserData !== null) {
			navigate('/dashboard/');
		}
	}, [allUserData, navigate]);

	// Update state on input change
	const handleBioDataChange = (event) => {
		setBioData({
			...bioData,
			[event.target.name]: event.target.value,
		});
	};

	// Form submission handler
	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMsg(null); // Clear previous errors

		const { error } = await login(bioData.email, bioData.password);

		if (error) {
			// Error message if login fails
			setErrorMsg('Invalid email or password. Please check your credentials.');
			setBioData({ ...bioData, password: '' });
		} else {
			navigate('/dashboard/');
		}

		setIsLoading(false);
	};

	return (
		<section className='container py-5 mt-5'>
			<div className='row align-items-center justify-content-center'>
				<div className='col-lg-5 col-md-8'>
					<div className='card shadow-lg border-0'>
						<div className='card-body p-5'>
							<div className='mb-4 text-center'>
								<h1 className='mb-1 fw-bold' style={{ color: '#1a2d23' }}>
									Login
								</h1>
								<p className='text-muted'>
									Don’t have an account?
									<Link to='/register/' className='ms-2 fw-bold text-success text-decoration-none'>
										Register
									</Link>
								</p>
							</div>

							{errorMsg && (
								<div className='alert alert-danger py-2 px-3 small d-flex align-items-center border-0' role='alert' style={{ borderRadius: '8px' }}>
									<i className='bi bi-exclamation-triangle-fill me-2'></i>
									<div>{errorMsg}</div>
								</div>
							)}
							<form onSubmit={handleLogin} className='needs-validation'>
								{/* Email field */}
								<div className='mb-3'>
									<label htmlFor='email' className='form-label fw-semibold'>
										Email Address
									</label>
									<input type='email' className='form-control py-2' name='email' placeholder='johndoe@gmail.com' value={bioData.email} onChange={handleBioDataChange} required />
								</div>

								{/* Password field */}
								<div className='mb-3'>
									<label htmlFor='password' className='form-label fw-semibold'>
										Password
									</label>
									<input type='password' className='form-control py-2' name='password' placeholder='**************' value={bioData.password} onChange={handleBioDataChange} required />
								</div>

								{/* Helper link */}
								<div className='d-flex justify-content-between align-items-center mb-4'>
									<Link to='/forgot-password/' className='small text-success text-decoration-none fw-bold'>
										Forgot password?
									</Link>
								</div>

								{/* Submit button */}
								<div className='d-grid'>
									<button className='btn btn-success py-2 fw-bold' type='submit' disabled={isLoading} style={{ backgroundColor: '#22c55e', border: 'none' }}>
										{isLoading ? (
											<>
												<span className='me-2'>Processing...</span>
												<i className='fas fa-spinner fa-spin' />
											</>
										) : (
											<>
												<span className='me-2'>Login</span>
												<i className='fas fa-sign-in-alt' />
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Login;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleEmailSubmit = (e) => {
		e.preventDefault();
		setIsLoading(true);

		// Imitating an API call
		setTimeout(() => {
			setIsLoading(false);
			setEmail(''); // Clear the email input after submission

			// Show success notification
			Swal.fire({
				icon: 'success',
				title: 'Check your email',
				text: 'We have sent a password reset link to your inbox.',
				confirmButtonColor: '#22c55e',
			});
		}, 1500);
	};

	return (
		<section className='container py-4 py-md-5 mt-4 mt-md-5'>
			<div className='row align-items-center justify-content-center'>
				<div className='col-lg-5 col-md-8'>
					<div className='card shadow-lg border-0'>
						<div className='card-body p-4 p-md-5'>
							<div className='mb-4 text-center'>
								<h1 className='mb-1 fw-bold' style={{ color: '#1a2d23' }}>
									Forgot Password
								</h1>
								<p className='text-muted small'>Enter your email and we'll send you a link to reset your password.</p>
							</div>

							<form onSubmit={handleEmailSubmit}>
								<div className='mb-4'>
									<label htmlFor='email' className='form-label fw-semibold small text-muted text-uppercase'>
										Email Address
									</label>
									<input onChange={(e) => setEmail(e.target.value)} value={email} type='email' id='email' className='form-control py-2' placeholder='johndoe@gmail.com' required />
								</div>

								<div className='d-grid'>
									<button type='submit' disabled={isLoading} className='btn btn-success py-2 fw-bold text-white' style={{ backgroundColor: '#22c55e', border: 'none' }}>
										{isLoading ? (
											<>
												<span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
												Sending...
											</>
										) : (
											<>
												Reset Password <i className='fas fa-arrow-right ms-2'></i>
											</>
										)}
									</button>
								</div>
							</form>

							<div className='mt-4 text-center'>
								<Link to='/login/' className='small text-success fw-bold text-decoration-none'>
									<i className='bi bi-chevron-left small me-1'></i> Back to Login
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default ForgotPassword;

import React, { useState } from 'react';
import Swal from 'sweetalert2';

function Contact() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});

	// Handle form input changes
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Show success notification
		Swal.fire({
			icon: 'success',
			title: 'Successfully Sent',
			text: 'We have sent your message to our team.',
			confirmButtonColor: '#22c55e',
		});

		setFormData({ name: '', email: '', subject: '', message: '' });
	};

	return (
		<section className='py-5 bg-light' style={{ minHeight: '85vh' }}>
			<div className='container'>
				{/* Header */}
				<div className='text-center mb-5'>
					<h1 className='display-5 fw-bold text-dark' style={{ color: '#1a2d23' }}>
						Contact Us
					</h1>
					<p className='text-muted mx-auto' style={{ maxWidth: '600px' }}>
						Have questions about a clean-up event or need help with a report? The Cleaner Ipswich IP3 team is here to help!
					</p>
				</div>

				<div className='row g-4 justify-content-center'>
					{/* Contact info cards */}
					<div className='col-lg-4'>
						<div className='card border-0 shadow-sm rounded-4 p-4 mb-4 text-center'>
							<div className='rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '60px', height: '60px' }}>
								<i className='bi bi-envelope-fill fs-3'></i>
							</div>
							<h5 className='fw-bold'>Email Us</h5>
							<p className='text-muted mb-0'>info@cleaneripswichip3.co.uk</p>
						</div>

						<div className='card border-0 shadow-sm rounded-4 p-4 mb-4 text-center'>
							<div className='rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '60px', height: '60px' }}>
								<i className='bi bi-telephone-fill fs-3'></i>
							</div>
							<h5 className='fw-bold'>Call Us</h5>
							<p className='text-muted mb-0'>+44 1473 000 000</p>
							<p className='text-muted'>Mon-Fri, 9am - 5pm</p>
						</div>

						<div className='card border-0 shadow-sm rounded-4 p-4 text-center'>
							<div className='rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '60px', height: '60px' }}>
								<i className='bi bi-geo-alt-fill fs-3'></i>
							</div>
							<h5 className='fw-bold'>Office</h5>
							<p className='text-muted mb-0'>The Waterfront, Neptune Quay</p>
							<p className='text-muted'>Ipswich, IP3 0AN</p>
						</div>
					</div>

					{/* Contact form */}
					<div className='col-lg-7'>
						<div className='card border-0 shadow-sm rounded-4 p-4 p-md-5'>
							<h3 className='fw-bold mb-4'>Send a Message</h3>
							<form onSubmit={handleSubmit}>
								<div className='row g-3'>
									<div className='col-md-6'>
										<label className='form-label small fw-bold text-muted'>Your Name</label>
										<input type='text' name='name' value={formData.name} onChange={handleChange} className='form-control border-light-subtle rounded-3 p-3' placeholder='John Doe' required />
									</div>
									<div className='col-md-6'>
										<label className='form-label small fw-bold text-muted'>Your Email</label>
										<input
											type='email'
											name='email'
											value={formData.email}
											onChange={handleChange}
											className='form-control border-light-subtle rounded-3 p-3'
											placeholder='john@example.com'
											required
										/>
									</div>
									<div className='col-12'>
										<label className='form-label small fw-bold text-muted'>Subject</label>
										<input
											type='text'
											name='subject'
											value={formData.subject}
											onChange={handleChange}
											className='form-control border-light-subtle rounded-3 p-3'
											placeholder='How can we help?'
											required
										/>
									</div>
									<div className='col-12'>
										<label className='form-label small fw-bold text-muted'>Message</label>
										<textarea
											name='message'
											value={formData.message}
											onChange={handleChange}
											className='form-control border-light-subtle rounded-3 p-3'
											rows='5'
											placeholder='Describe your inquiry...'
											required
										></textarea>
									</div>
									<div className='col-12 pt-2'>
										<button type='submit' className='btn btn-success w-100 rounded-pill py-3 fw-bold shadow-sm transition-all'>
											Send Message <i className='bi bi-send-fill ms-2'></i>
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Contact;

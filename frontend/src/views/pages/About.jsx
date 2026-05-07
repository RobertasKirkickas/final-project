import React from 'react';
import { Link } from 'react-router-dom';

function About() {
	return (
		<section className='py-5 bg-light' style={{ minHeight: '85vh' }}>
			<div className='container'>
				{/* Header */}
				<div className='row justify-content-center text-center mb-5'>
					<div className='col-lg-8'>
						<h1 className='display-4 fw-bold text-dark mb-4' style={{ color: '#1a2d23' }}>
							Restoring the Beauty of
							<span className='text-success d-block'>Ipswich IP3</span>
						</h1>
						<p className='lead text-muted px-md-5'>
							Cleaner Ipswich is a community-driven platform dedicated to keeping our streets, parks, and waterfronts free from litter. We believe that a cleaner environment leads to a stronger,
							happier community.
						</p>
					</div>
				</div>

				<hr className='my-5 opacity-25' />

				{/* Core features */}
				<div className='row g-4 mb-5'>
					<div className='col-md-4'>
						<div className='card border-0 shadow-sm rounded-4 p-4 h-100 text-center'>
							<div className='rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '70px', height: '70px' }}>
								<i className='bi bi-megaphone-fill fs-2'></i>
							</div>
							<h4 className='fw-bold'>Report</h4>
							<p className='text-muted small'>Spot some litter? Take a photo and report it. Whether it's fly-tipping in an alleyway or litter in Landseer Park, your voice matters.</p>
						</div>
					</div>
					<div className='col-md-4'>
						<div className='card border-0 shadow-sm rounded-4 p-4 h-100 text-center'>
							<div className='rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '70px', height: '70px' }}>
								<i className='bi bi-calendar-check-fill fs-2'></i>
							</div>
							<h4 className='fw-bold'>Organise</h4>
							<p className='text-muted small'>We help local volunteers organise clean-up events. Join a scheduled event or start your own to tackle problem areas together.</p>
						</div>
					</div>
					<div className='col-md-4'>
						<div className='card border-0 shadow-sm rounded-4 p-4 h-100 text-center'>
							<div className='rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '70px', height: '70px' }}>
								<i className='bi bi-stars fs-2'></i>
							</div>
							<h4 className='fw-bold'>See the Difference</h4>
							<p className='text-muted small'>We showcase the impact of every clean-up effort, proving that when the IP3 community comes together, the transformation is impossible to miss.</p>
						</div>
					</div>
				</div>

				{/* Local connection */}
				<div className='row align-items-center bg-white rounded-5 shadow-sm overflow-hidden g-0 mb-5'>
					<div className='col-md-6'>
						<img
							src='https://images.unsplash.com/photo-1680216370618-f9938e5c9a17?auto=format&fit=crop&q=80&w=800'
							alt='Ipswich Waterfront'
							className='img-fluid h-100'
							style={{ objectFit: 'cover', minHeight: '350px' }}
						/>
					</div>
					<div className='col-md-6 p-4 p-md-5'>
						<h2 className='fw-bold mb-4'>Why IP3?</h2>
						<p className='text-muted mb-4'>
							From the historic <strong>Ipswich Waterfront</strong> to the sprawling greens of <strong>Holywells Park</strong>, the IP3 area is full of life and potential. However, litter can quickly
							diminish the pride we feel for our neighborhoods.
						</p>
						<p className='text-muted mb-4'>Our platform was born out of a desire to protect our local wildlife and keep our residential streets safe for families.</p>
						<Link to='/categories/' className='btn btn-success rounded-pill px-4 fw-bold'>
							Explore Local Areas
						</Link>
					</div>
				</div>

				{/* Call to action */}
				<div className='text-center py-5 rounded-4 bg-dark text-white shadow-lg px-4'>
					<h2 className='fw-bold mb-3'>Ready to make a difference?</h2>
					<p className='mb-4 opacity-75 mx-auto' style={{ maxWidth: '600px' }}>
						Join hundreds of local residents who are committed to a litter-free Ipswich. Every report and every volunteer counts.
					</p>
					<div className='d-flex flex-wrap justify-content-center gap-3'>
						<Link to='/register/' className='btn btn-light btn-lg rounded-pill px-5 fw-bold text-dark'>
							Join the Community
						</Link>
						<Link to='/contact/' className='btn btn-outline-light btn-lg rounded-pill px-5 fw-bold'>
							Contact Us
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

export default About;

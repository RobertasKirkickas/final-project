import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
	return (
		<footer className='text-white py-5 mt-auto' style={{ backgroundColor: '#1a2d23', borderTop: '2px solid #2e4a3c' }}>
			<div className='container-fluid px-lg-5'>
				<div className='row align-items-center'>
					{/* Copyright */}
					<div className='col-md-6 text-center text-md-start mb-3 mb-md-0'>
						<p className='mb-0'>
							&copy; {new Date().getFullYear()}
							<Link to='/' className='ms-2 fw-bold text-decoration-none' style={{ color: '#4ade80' }}>
								Cleaner Ipswich (IP3)
							</Link>
							<span className='ms-2 text-white-50'>| All rights reserved</span>
						</p>
					</div>

					{/* Quick navigation links */}
					<div className='col-md-6 text-center text-md-end'>
						<ul className='list-inline mb-0'>
							<li className='list-inline-item me-4'>
								<Link to='/about/' className='text-white-50 text-decoration-none'>
									About
								</Link>
							</li>
							<li className='list-inline-item me-4'>
								<Link to='/contact/' className='text-white-50 text-decoration-none'>
									Contact
								</Link>
							</li>
							<li className='list-inline-item'>
								<Link to='/categories/' className='text-white-50 text-decoration-none'>
									Categories
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom text */}
				<div className='row mt-4'>
					<div className='col-12 text-center'>
						<small className='text-white-50' style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
							WORKING TOGETHER FOR A LITTER-FREE COMMUNITY
						</small>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;

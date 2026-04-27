import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

function Header() {
	// Accessing authentication state and user data
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
	const user = useAuthStore((state) => state.user);

	return (
		<header className='navbar-dark sticky-top shadow-sm' style={{ backgroundColor: '#1a2d23', borderBottom: '2px solid #2e4a3c' }}>
			<nav className='navbar navbar-expand-lg py-3'>
				<div className='container-fluid px-lg-5'>
					{/* Logo */}
					<Link className='navbar-brand d-flex align-items-center' to='/'>
						<span className='fw-bold fs-3' style={{ color: '#4ade80' }}>
							Cleaner
						</span>
						<span className='fw-bold fs-3 text-white ms-1'>Ipswich (IP3)</span>
					</Link>

					{/* Mobile Nav */}
					<button
						className='navbar-toggler'
						type='button'
						data-bs-toggle='collapse'
						data-bs-target='#navbarCollapse'
						aria-controls='navbarCollapse'
						aria-expanded='false'
						aria-label='Toggle navigation'
					>
						<span className='navbar-toggler-icon' />
					</button>

					{/* Main Nav content */}
					<div className='collapse navbar-collapse' id='navbarCollapse'>
						{/* Search bar */}
						<div className='nav mt-3 mt-lg-0 px-lg-5 flex-grow-1'>
							<form className='w-100 position-relative' style={{ maxWidth: '500px' }}>
								<input
									className='form-control pe-5 border-0 py-2'
									type='search'
									placeholder='Search litter reports...'
									aria-label='Search'
									style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
								/>
								<Link to='/search/' className='btn position-absolute top-50 end-0 translate-middle-y border-0'>
									<i className='bi bi-search text-white-50'></i>
								</Link>
							</form>
						</div>

						{/* Nav links (right side) */}
						<ul className='navbar-nav align-items-lg-center ms-auto'>
							<li className='nav-item'>
								<Link className='nav-link px-3 text-white' to='/'>
									Home
								</Link>
							</li>

							{/* Explore Dropdown */}
							<li className='nav-item dropdown'>
								<a className='nav-link dropdown-toggle px-3 text-white' href='#' id='pagesMenu' data-bs-toggle='dropdown' aria-expanded='false'>
									Explore
								</a>
								<ul className='dropdown-menu dropdown-menu-end shadow' aria-labelledby='pagesMenu'>
									<li>
										<Link className='dropdown-item' to='/categories/'>
											<i className='bi bi-grid-fill me-2'></i>Categories
										</Link>
									</li>
									<li>
										<hr className='dropdown-divider' />
									</li>
									<li>
										<Link className='dropdown-item' to='/about/'>
											About Project
										</Link>
									</li>
									<li>
										<Link className='dropdown-item' to='/contact/'>
											Contact Support
										</Link>
									</li>
								</ul>
							</li>

							{/* User Menu */}
							{isLoggedIn() ? (
								<li className='nav-item dropdown ms-lg-3'>
									<a
										className='btn dropdown-toggle w-100 mt-2 mt-lg-0 text-white'
										href='#'
										id='userMenu'
										data-bs-toggle='dropdown'
										aria-expanded='false'
										style={{ backgroundColor: '#2e4a3c', border: '1px solid #4ade80' }}
									>
										<i className='bi bi-person-circle me-2'></i>
										{user().username}
									</a>
									<ul className='dropdown-menu dropdown-menu-end shadow' aria-labelledby='userMenu'>
										<li>
											<Link className='dropdown-item' to='/dashboard/'>
												<i className='bi bi-speedometer2 me-2'></i>Dashboard
											</Link>
										</li>
										<li>
											<hr className='dropdown-divider' />
										</li>
										<li>
											<Link className='dropdown-item text-danger' to='/logout/'>
												<i className='bi bi-box-arrow-right me-2'></i>Logout
											</Link>
										</li>
									</ul>
								</li>
							) : (
								<div className='d-flex gap-2 ms-lg-3 mt-3 mt-lg-0'>
									<Link to='/login/' className='btn btn-success px-4 fw-bold' style={{ backgroundColor: '#22c55e', border: 'none' }}>
										Login
									</Link>
								</div>
							)}
						</ul>
					</div>
				</div>
			</nav>
		</header>
	);
}

export default Header;

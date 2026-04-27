import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

function Header() {
	// Accessing authentication state and user data
	const allUserData = useAuthStore((state) => state.allUserData);
	const user = useAuthStore((state) => state.user);
	const isLoggedIn = allUserData !== null;

	return (
		<header className='navbar-dark sticky-top shadow-sm' style={{ backgroundColor: '#1a2d23', borderBottom: '2px solid #2e4a3c' }}>
			<nav className='navbar py-3'>
				<div className='container-fluid px-2 px-lg-5 d-flex align-items-center justify-content-between flex-nowrap'>
					{/* Logo */}
					<Link className='navbar-brand d-flex align-items-center me-2' to='/'>
						<div className='d-none d-sm-flex align-items-center'>
							<span className='fw-bold fs-3' style={{ color: '#4ade80' }}>
								Cleaner
							</span>
							<span className='fw-bold fs-3 text-white ms-1'>Ipswich (IP3)</span>
						</div>
						<div className='d-flex d-sm-none align-items-center fw-bold fs-4'>
							<span style={{ color: '#4ade80' }}>[</span>
							<span className='text-white'>CI.IP3</span>
							<span style={{ color: '#4ade80' }}>]</span>
						</div>
					</Link>

					{/* Search bar */}
					<div className='flex-grow-1 px-1 px-md-5'>
						<form className='w-100 position-relative' style={{ maxWidth: '500px', margin: '0 auto' }}>
							<input
								className='form-control pe-5 border-0 py-2'
								type='search'
								placeholder='Search...'
								aria-label='Search'
								style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '0.9rem' }}
							/>
							<Link to='/search/' className='btn position-absolute top-50 end-0 translate-middle-y border-0 p-2'>
								<i className='bi bi-search text-white-50'></i>
							</Link>
						</form>
					</div>

					{/* Nav links */}

					<ul className='navbar-nav flex-row align-items-center ms-auto gap-2 gap-sm-3'>
						{/* Explore Dropdown */}
						<li className='nav-item dropdown'>
							<a className='nav-link dropdown-toggle px-2 text-white' href='#' id='pagesMenu' data-bs-toggle='dropdown' aria-expanded='false'>
								<span className='d-none d-md-inline'>Explore</span>
								<i className='bi bi-compass d-inline d-md-none fs-5'></i>
							</a>
							<ul className='dropdown-menu dropdown-menu-end shadow position-absolute' aria-labelledby='pagesMenu'>
								<li>
									<Link className='dropdown-item' to='/categories/'>
										<i className='bi bi-grid-fill me-2'></i>Categories
									</Link>
								</li>
								<li>
									<hr className='dropdown-divider' />
								</li>
								<li>
									<Link className='dropdown-item' to='/'>
										Home
									</Link>
								</li>
								<li>
									<Link className='dropdown-item' to='/about/'>
										About
									</Link>
								</li>
								<li>
									<Link className='dropdown-item' to='/contact/'>
										Contact
									</Link>
								</li>
							</ul>
						</li>

						{/* User Menu */}
						{isLoggedIn ? (
							<li className='nav-item dropdown'>
								<a
									className='btn dropdown-toggle d-flex align-items-center text-white px-2 py-1'
									href='#'
									id='userMenu'
									data-bs-toggle='dropdown'
									aria-expanded='false'
									style={{ backgroundColor: '#2e4a3c', border: '1px solid #4ade80' }}
								>
									<i className='bi bi-person-circle'></i>
									<span className='ms-2 d-none d-md-inline small'>{user().username}</span>
								</a>
								<ul className='dropdown-menu dropdown-menu-end shadow position-absolute' aria-labelledby='userMenu'>
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
							<li className='nav-item'>
								<Link to='/login/' className='btn btn-success px-3 py-1 fw-bold' style={{ backgroundColor: '#22c55e', border: 'none', fontSize: '0.9rem' }}>
									Login
								</Link>
							</li>
						)}
					</ul>
				</div>
			</nav>
		</header>
	);
}

export default Header;

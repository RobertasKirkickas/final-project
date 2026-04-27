import { Route, Routes, BrowserRouter } from 'react-router-dom';

// Layouts
import MainWrapper from './layouts/MainWrapper';
import PrivateRoute from './layouts/PrivateRoute';

// Core Views
import Index from './views/core/Index';
import Details from './views/core/Details';
import Search from './views/core/Search';
import Category from './views/core/Category';

// Auth Views
import Register from './views/auth/Register';
import Login from './views/auth/Login';
import Logout from './views/auth/Logout';
import ForgotPassword from './views/auth/ForgotPassword';
import CreatePassword from './views/auth/CreatePassword';

// Dashboard Views
import Dashboard from './views/dashboard/Dashboard';
import Posts from './views/dashboard/Posts';
import AddPost from './views/dashboard/AddPost';
import EditPost from './views/dashboard/EditPost';
import Comments from './views/dashboard/Comments';
import Notifications from './views/dashboard/Notifications';
import Profile from './views/dashboard/Profile';

// Pages
import About from './views/pages/About';
import Contact from './views/pages/Contact';

function App() {
	return (
		<BrowserRouter>
			<MainWrapper>
				<Routes>
					{/* Public Core Routes */}
					<Route path='/' element={<Index />} />
					<Route path='/:slug/' element={<Details />} />
					<Route path='/category/' element={<Category />} />
					<Route path='/search/' element={<Search />} />

					{/* Authentication Routes */}
					<Route path='/register/' element={<Register />} />
					<Route path='/login/' element={<Login />} />
					<Route path='/logout/' element={<Logout />} />
					<Route path='/forgot-password/' element={<ForgotPassword />} />
					<Route path='/create-password/' element={<CreatePassword />} />

					{/* Protected Dashboard Routes */}
					<Route
						path='/dashboard/'
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path='/posts/'
						element={
							<PrivateRoute>
								<Posts />
							</PrivateRoute>
						}
					/>
					<Route
						path='/add-post/'
						element={
							<PrivateRoute>
								<AddPost />
							</PrivateRoute>
						}
					/>
					<Route
						path='/edit-post/:id/'
						element={
							<PrivateRoute>
								<EditPost />
							</PrivateRoute>
						}
					/>
					<Route
						path='/comments/'
						element={
							<PrivateRoute>
								<Comments />
							</PrivateRoute>
						}
					/>
					<Route
						path='/notifications/'
						element={
							<PrivateRoute>
								<Notifications />
							</PrivateRoute>
						}
					/>
					<Route
						path='/profile/'
						element={
							<PrivateRoute>
								<Profile />
							</PrivateRoute>
						}
					/>

					{/* Public Pages */}
					<Route path='/about/' element={<About />} />
					<Route path='/contact/' element={<Contact />} />
				</Routes>
			</MainWrapper>
		</BrowserRouter>
	);
}

export default App;

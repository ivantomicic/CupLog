import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./components/Home";
import Brewers from "./components/Brewers";
import Grinders from "./components/Grinders";
import Coffee from "./components/Coffee";
import Brews from "./components/Brews";
import BrewDetails from "./components/BrewDetails";
import CoffeeDetails from "./components/CoffeeDetails";
import GrinderDetails from "./components/GrinderDetails";
import BrewerDetails from "./components/BrewerDetails";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Settings from "./components/Settings";
import UpdatePassword from "./components/UpdatePassword";
import PrivateRoute from "./components/PrivateRoute";
import { logout, onAuthStateChange } from "./utils/auth";

function NavBar() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);

	useEffect(() => {
		const {
			data: { subscription },
		} = onAuthStateChange((user) => {
			setUser(user);
		});

		return () => {
			subscription?.unsubscribe();
		};
	}, []);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	if (!user) return null;

	return (
		<nav>
			<ul>
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/brewers">Brewers</Link>
				</li>
				<li>
					<Link to="/grinders">Grinders</Link>
				</li>
				<li>
					<Link to="/coffee">Coffee</Link>
				</li>
				<li>
					<Link to="/brews">Brews</Link>
				</li>
				<li>
					<Link to="/settings">Settings</Link>
				</li>
				<li>
					<button onClick={handleLogout}>Logout</button>
				</li>
			</ul>
		</nav>
	);
}

function App() {
	return (
		<Router>
			<div>
				<NavBar />

				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<SignUp />} />
					<Route
						path="/update-password"
						element={<UpdatePassword />}
					/>

					<Route
						path="/brewers"
						element={
							<PrivateRoute>
								<Brewers />
							</PrivateRoute>
						}
					/>
					<Route
						path="/brewers/:id"
						element={
							<PrivateRoute>
								<BrewerDetails />
							</PrivateRoute>
						}
					/>

					<Route
						path="/grinders"
						element={
							<PrivateRoute>
								<Grinders />
							</PrivateRoute>
						}
					/>
					<Route
						path="/grinders/:id"
						element={
							<PrivateRoute>
								<GrinderDetails />
							</PrivateRoute>
						}
					/>

					<Route
						path="/coffee"
						element={
							<PrivateRoute>
								<Coffee />
							</PrivateRoute>
						}
					/>
					<Route
						path="/coffee/:id"
						element={
							<PrivateRoute>
								<CoffeeDetails />
							</PrivateRoute>
						}
					/>

					<Route
						path="/brews"
						element={
							<PrivateRoute>
								<Brews />
							</PrivateRoute>
						}
					/>
					<Route
						path="/brews/:id"
						element={
							<PrivateRoute>
								<BrewDetails />
							</PrivateRoute>
						}
					/>

					<Route
						path="/settings"
						element={
							<PrivateRoute>
								<Settings />
							</PrivateRoute>
						}
					/>

					<Route
						path="/"
						element={
							<PrivateRoute>
								<Home />
							</PrivateRoute>
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Brewers from "./components/Brewers";
import Grinders from "./components/Grinders";
import Coffee from "./components/Coffee";
import BrewDetails from "./components/BrewDetails";
import CoffeeDetails from "./components/CoffeeDetails";
import GrinderDetails from "./components/GrinderDetails";
import BrewerDetails from "./components/BrewerDetails";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Settings from "./components/Settings";
import UpdatePassword from "./components/UpdatePassword";
import PrivateRoute from "./components/PrivateRoute";
import Navigation from "./components/Navigation";
import NewBrew from "./components/NewBrew";

function App() {
	return (
		<Router>
			<div>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<SignUp />} />
					<Route
						path="/update-password"
						element={<UpdatePassword />}
					/>
					<Route
						path="/*"
						element={
							<PrivateRoute>
								<PrivateRoutes />
							</PrivateRoute>
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

function PrivateRoutes() {
	return (
		<>
			<Navigation />
			<main className="main-content">
				<Routes>
					<Route path="/brewers" element={<Brewers />} />
					<Route path="/brewers/:id" element={<BrewerDetails />} />
					<Route path="/grinders" element={<Grinders />} />
					<Route path="/grinders/:id" element={<GrinderDetails />} />
					<Route path="/coffee" element={<Coffee />} />
					<Route path="/coffee/:id" element={<CoffeeDetails />} />
					<Route path="/brews/new" element={<NewBrew />} />
					<Route path="/brews/:id" element={<BrewDetails />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/" element={<Home />} />
				</Routes>
			</main>
		</>
	);
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./misc/Home";
import Brewers from "./brewers/Brewers";
import Grinders from "./grinders/Grinders";
import Beans from "./beans/Beans";
import Roasteries from "./roasteries/Roasteries";
import BrewDetails from "./brews/BrewDetails";
import BeansDetails from "./beans/BeansDetails";
import GrinderDetails from "./grinders/GrinderDetails";
import BrewerDetails from "./brewers/BrewerDetails";
import Login from "./auth/Login";
import SignUp from "./auth/SignUp";
import Settings from "./misc/Settings";
import UpdatePassword from "./auth/UpdatePassword";
import PrivateRoute from "./auth/PrivateRoute";
import Navigation from "./layout/Navigation";
import NewBrew from "./brews/NewBrew";
import PageHeader from "./layout/PageHeader";
import { PageHeaderProvider } from "./context/PageHeaderContext";

function App() {
	return (
		<Router>
			<PageHeaderProvider>
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
			</PageHeaderProvider>
		</Router>
	);
}

function PrivateRoutes() {
	return (
		<>
			<Navigation />
			<PageHeader />

			<Routes>
				<Route path="/brewers" element={<Brewers />} />
				<Route path="/brewers/:id" element={<BrewerDetails />} />
				<Route path="/grinders" element={<Grinders />} />
				<Route path="/grinders/:id" element={<GrinderDetails />} />
				<Route path="/beans" element={<Beans />} />
				<Route path="/roasteries" element={<Roasteries />} />
				<Route path="/beans/:id" element={<BeansDetails />} />
				<Route path="/brews/new" element={<NewBrew />} />
				<Route path="/brews/:id" element={<BrewDetails />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/" element={<Home />} />
			</Routes>
		</>
	);
}

export default App;

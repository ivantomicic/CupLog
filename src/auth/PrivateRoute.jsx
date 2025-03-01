import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Loader from "../misc/Loader";
import { isAuthenticated } from "../utils/auth";

export default function PrivateRoute({ children }) {
	const [authChecked, setAuthChecked] = useState(false);
	const [isAuth, setIsAuth] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const auth = await isAuthenticated();
			setIsAuth(auth);
			setAuthChecked(true);
		};
		checkAuth();
	}, []);

	if (!authChecked) {
		return <Loader />;
	}

	return isAuth ? children : <Navigate to="/login" />;
}

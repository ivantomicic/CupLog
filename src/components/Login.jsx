import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, loginWithGoogle, getCurrentUser } from "../utils/auth";
import ImageMarquee from "./ImageMarquee";

export default function Login() {
	const navigate = useNavigate();
	const [credentials, setCredentials] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const loginImages = [
		"/login-1.jpg",
		"/login-2.jpg",
		"/login-3.jpg",
		"/login-4.jpg",
		"/login-5.jpg",
		"/login-6.jpg",
		"/login-7.jpg",
		"/login-8.jpg",
		"/login-9.jpg",
	];

	useEffect(() => {
		// Check if user is already logged in
		const checkAuth = async () => {
			const user = await getCurrentUser();
			if (user) {
				navigate("/");
			}
		};
		checkAuth();
	}, [navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await login(credentials.email, credentials.password);
			navigate("/");
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		setError("");

		try {
			const { error } = await loginWithGoogle();
			if (error) throw error;
			// The redirect will happen automatically
		} catch (err) {
			setError(err.message);
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<ImageMarquee images={loginImages} columns={3} />
				<div className="login-form-container">
					<div className="logo-container">
						<img
							src="/cuplog-icon.svg"
							alt="CupLog"
							className="logo"
						/>
					</div>
					<h2 className="login-title">Login</h2>
					{error && <div className="error-message">{error}</div>}
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label className="form-label">
								Email:
								<input
									type="email"
									value={credentials.email}
									onChange={(e) =>
										setCredentials({
											...credentials,
											email: e.target.value,
										})
									}
									className="form-input"
									required
								/>
							</label>
						</div>
						<div className="form-group">
							<label className="form-label">
								Password:
								<input
									type="password"
									value={credentials.password}
									onChange={(e) =>
										setCredentials({
											...credentials,
											password: e.target.value,
										})
									}
									className="form-input"
									required
								/>
							</label>
						</div>
						<button
							type="submit"
							className="login-button"
							disabled={isLoading}
						>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</form>

					<div className="divider">or</div>

					<button
						onClick={handleGoogleLogin}
						className="google-button"
						disabled={isLoading}
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</button>

					<div className="signup-container">
						<p className="signup-text">
							Don&apos;t have an account?{" "}
							<Link to="/signup" className="signup-link">
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

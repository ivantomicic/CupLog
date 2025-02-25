import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { resetPassword } from "../utils/auth";
import { updateUserProfile } from "../utils/supabase-queries";
import Loader from "./Loader";

export default function Settings() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [resetSent, setResetSent] = useState(false);
	const [error, setError] = useState(null);
	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarPreview, setAvatarPreview] = useState(null);

	useEffect(() => {
		loadUserData();
	}, []);

	const loadUserData = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setLoading(false);
				return;
			}

			// Ensure user exists in the users table
			const { data: profile, error: profileError } = await supabase
				.from("users")
				.upsert({ id: user.id, email: user.email })
				.select()
				.single();

			if (profileError) throw profileError;

			setUser({ ...user, ...profile });
		} catch (error) {
			console.error("Error loading user data:", error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAvatarFile(file);
			// Create preview URL
			const previewUrl = URL.createObjectURL(file);
			setAvatarPreview(previewUrl);
		}
	};

	const handleSave = async () => {
		if (!avatarFile) return;

		try {
			setSaving(true);
			setError(null);
			await updateUserProfile({
				avatar: avatarFile,
				avatar_url: user.avatar_url,
			});
			await loadUserData();
			setAvatarFile(null);
			setAvatarPreview(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	const getAuthMethods = () => {
		if (!user) return [];

		const methods = new Set();

		// Check identities from user metadata
		if (user.identities) {
			user.identities.forEach((identity) => {
				if (identity.provider === "google") {
					methods.add("Google");
				} else if (identity.provider === "email") {
					methods.add("Email and Password");
				} else {
					methods.add(identity.provider);
				}
			});
		}

		return Array.from(methods);
	};

	const handlePasswordReset = async () => {
		try {
			setError(null);
			await resetPassword(user.email);
			setResetSent(true);
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) return <Loader />;
	if (!user) return <div>Please log in to view settings</div>;

	const authMethods = getAuthMethods();
	const hasEmailAuth = authMethods.includes("Email and Password");

	return (
		<div>
			<h2>Settings</h2>

			{error && <div>{error}</div>}
			{resetSent && (
				<div>Password reset email sent! Please check your inbox.</div>
			)}

			<div>
				<h3>Profile</h3>
				<div>
					<div>
						<h4>Avatar</h4>
						{(user.avatar_url || avatarPreview) && (
							<img
								src={avatarPreview || user.avatar_url}
								alt="Avatar"
								width="100"
								height="100"
							/>
						)}
						<div>
							<input
								type="file"
								accept="image/*"
								onChange={handleAvatarChange}
							/>
						</div>
					</div>

					<h3>Account Information</h3>
					<div>
						<p>
							<strong>Email:</strong> {user.email}
						</p>
						<p>
							<strong>Last Sign In:</strong>{" "}
							{new Date(user.last_sign_in_at).toLocaleString()}
						</p>
					</div>

					<h4>Authentication Methods</h4>
					<div>
						<ul>
							{authMethods.map((method, index) => (
								<li key={index}>{method}</li>
							))}
						</ul>
					</div>

					{hasEmailAuth && (
						<div>
							<h4>Password Management</h4>
							<div>
								<button
									onClick={handlePasswordReset}
									disabled={resetSent}
								>
									Reset Password
								</button>
								<p>
									Click the button above to receive a password
									reset email.
								</p>
							</div>
						</div>
					)}

					<button
						onClick={handleSave}
						disabled={!avatarFile || saving}
					>
						{saving ? "Saving..." : "Save Settings"}
					</button>
				</div>
			</div>
		</div>
	);
}

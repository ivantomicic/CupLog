import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
	MdHome,
	MdCoffee,
	MdBlender,
	MdLocalCafe,
	MdAdd,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

const navItems = [
	{ to: "/", icon: MdHome, label: "Home" },
	{ to: "/coffee", icon: MdCoffee, label: "Coffee" },
	{ to: "/grinders", icon: MdBlender, label: "Grinders" },
	{ to: "/brewers", icon: MdLocalCafe, label: "Brewers" },
];

export default function Navigation() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const loadUser = async () => {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
		};
		loadUser();
	}, []);

	return (
		<>
			{/* Mobile Navigation */}
			<nav className="navigation-mobile">
				{navItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className="navigation-mobile-item"
						end={item.to === "/"}
					>
						<motion.div
							whileTap={{ scale: 0.9 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 17,
							}}
						>
							<item.icon />
						</motion.div>
						{item.label}
					</NavLink>
				))}
			</nav>

			{/* Desktop Navigation */}
			<nav className="navigation-desktop">
				<div className="logo">
					<img src="/cuplog-icon.svg" alt="CupLog" />
					<span>CupLog</span>
				</div>

				<div className="navigation-desktop-items">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className="navigation-desktop-item"
							end={item.to === "/"}
						>
							<item.icon />
							<span>{item.label}</span>
						</NavLink>
					))}
				</div>

				<div className="user-profile">
					<div className="user-avatar">
						{user?.user_metadata?.avatar_url ? (
							<img
								src={user.user_metadata.avatar_url}
								alt="Avatar"
							/>
						) : (
							<div className="avatar-placeholder">
								{user?.email?.[0]?.toUpperCase()}
							</div>
						)}
					</div>
					<div className="user-info">
						<span className="user-email">{user?.email}</span>
						<NavLink to="/settings" className="settings-link">
							Account Settings
						</NavLink>
					</div>
				</div>
			</nav>

			{/* Floating Action Button */}
			<NavLink to="/brews/new" className="fab">
				<motion.div
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}
				>
					<MdAdd />
				</motion.div>
			</NavLink>
		</>
	);
}

import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { MdHome, MdCoffee, MdBlender, MdLocalCafe } from "react-icons/md";
import { PiCoffeeBeanFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

const navItems = [
	{ to: "/", icon: MdHome, label: "Home" },
	{ to: "/coffee", icon: PiCoffeeBeanFill, label: "Coffee" },
	// { to: "/beans", icon: PiCoffeeBeanFill, label: "Beans" },
	// { to: "/roasteries", icon: PiCoffeeBeanFill, label: "Roasteries" },
	{ to: "/equipment", icon: MdBlender, label: "Equipment" },
	// { to: "/grinders", icon: MdBlender, label: "Grinders" },
	// { to: "/brewers", icon: MdLocalCafe, label: "Brewers" },
];

const MotionNavLink = motion(NavLink);

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
					<MotionNavLink
						key={item.to}
						to={item.to}
						className="navigation-mobile-item"
						end={item.to === "/"}
						whileTap={{ scale: 0.9 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 17,
						}}
					>
						<item.icon />
						{item.label}
					</MotionNavLink>
				))}
			</nav>

			{/* Desktop Navigation */}
			<nav className="navigation-desktop">
				<motion.div
					className="logo"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 17,
					}}
				>
					<img src="/cuplog-icon.svg" alt="CupLog" />
					<span>CupLog</span>
				</motion.div>

				<div className="navigation-desktop-items">
					{navItems.map((item) => (
						<MotionNavLink
							key={item.to}
							to={item.to}
							className="navigation-desktop-item"
							end={item.to === "/"}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 17,
							}}
						>
							<item.icon />
							<span>{item.label}</span>
						</MotionNavLink>
					))}
				</div>

				<div className="user-profile">
					<motion.div
						className="user-avatar"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 17,
						}}
					>
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
					</motion.div>
					<div className="user-info">
						<span className="user-email">{user?.email}</span>
						<MotionNavLink
							to="/settings"
							className="settings-link"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Account Settings
						</MotionNavLink>
					</div>
				</div>
			</nav>
		</>
	);
}

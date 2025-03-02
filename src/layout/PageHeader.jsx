import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlusCircle } from "react-icons/fi";
import PropTypes from "prop-types";
import { usePageHeader } from "../context/PageHeaderContext";
import { useEffect, useState } from "react";
import CustomDrawer from "../components/CustomDrawer"; // Adjust the path as necessary
import React from "react";

const MotionNavLink = motion(NavLink);

// Animation variants for the title
const titleVariants = {
	initial: { opacity: 0, y: -20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
};

// Animation variants for the button
const buttonVariants = {
	initial: { opacity: 0, scale: 0.8 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.8 },
	hover: { scale: 1.1 },
	tap: { scale: 0.9 },
};

export default function PageHeader() {
	const { headerState } = usePageHeader();
	const {
		title,
		buttonTarget,
		buttonComponent,
		buttonIcon,
		buttonComponentTitle,
	} = headerState;
	const [isDrawerOpen, setDrawerOpen] = useState(false);

	const handleDrawerOpen = () => setDrawerOpen(true);
	const handleDrawerClose = () => setDrawerOpen(false);

	return (
		<div
			className="page-header"
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			{/* Title with animation */}
			<div
				style={{ position: "relative", minHeight: "2rem", flexGrow: 1 }}
			>
				<AnimatePresence mode="wait">
					<motion.h2
						key={title}
						className="page-header-title"
						variants={titleVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 25,
							duration: 0.3,
						}}
					>
						{title}
					</motion.h2>
				</AnimatePresence>
			</div>

			{/* Button container - always present to maintain layout */}
			<div
				style={{
					width: buttonTarget || buttonComponent ? "auto" : "0px",
					overflow: "hidden",
					flexShrink: 0,
				}}
			>
				<AnimatePresence>
					{buttonTarget ||
						(buttonComponent && (
							<MotionNavLink
								to={buttonTarget || "#"}
								className="page-header-button"
								variants={buttonVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								whileHover="hover"
								whileTap="tap"
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 17,
								}}
								onClick={handleDrawerOpen}
							>
								{buttonIcon ? <buttonIcon /> : <FiPlusCircle />}
							</MotionNavLink>
						))}
				</AnimatePresence>
			</div>

			{!buttonTarget && buttonComponent && (
				<CustomDrawer
					isOpen={isDrawerOpen}
					onClose={handleDrawerClose}
					title={buttonComponentTitle}
				>
					{/* Correctly render the buttonComponent */}
					{buttonComponent ? (
						React.createElement(buttonComponent)
					) : (
						<div>Your form goes here</div>
					)}
				</CustomDrawer>
			)}
		</div>
	);
}

// For backward compatibility with direct usage
export function PageHeaderDirect({ title, buttonTarget }) {
	const { updateHeader } = usePageHeader();

	// Update the header state when props change
	useEffect(() => {
		updateHeader({ title, buttonTarget });
	}, [title, buttonTarget, updateHeader]);

	return null;
}

PageHeaderDirect.propTypes = {
	title: PropTypes.string.isRequired,
	buttonTarget: PropTypes.string,
};

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { usePageHeader } from "../context/PageHeaderContext";

// Animation variants for the title
const titleVariants = {
	initial: { opacity: 0, y: -20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
};

export default function PageHeader() {
	const { headerState } = usePageHeader();
	const { title, actionComponent } = headerState;

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

			{actionComponent}
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

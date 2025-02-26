import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlusCircle } from "react-icons/fi";

const MotionNavLink = motion(NavLink);

export default function PageHeader({ title, buttonTarget }) {
	return (
		<div className="page-header">
			<h2 className="page-header-title">{title}</h2>

			{buttonTarget && (
				<MotionNavLink
					to={buttonTarget}
					className="page-header-button"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 17,
					}}
				>
					<FiPlusCircle />
				</MotionNavLink>
			)}
		</div>
	);
}

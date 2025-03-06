import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loader from "../misc/Loader";
import { getBeans } from "../utils/supabase";
import { Card, CardBody } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to get the closest roast date to today
const getClosestRoastDate = (roastDates) => {
	if (!roastDates || roastDates.length === 0) return null;
	const today = new Date();
	return roastDates.reduce((closest, current) => {
		const closestDate = new Date(closest);
		const currentDate = new Date(current);
		const closestDiff = Math.abs(today - closestDate);
		const currentDiff = Math.abs(today - currentDate);
		return currentDiff < closestDiff ? current : closest;
	});
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

export default function Beans() {
	// Query for fetching beans with caching
	const {
		data: beans = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["beans"],
		queryFn: getBeans,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
			<AnimatePresence>
				{beans.map((bean, index) => {
					const closestRoastDate = getClosestRoastDate(
						bean.roast_dates
					);
					return (
						<motion.div
							key={bean.id}
							variants={itemVariants}
							initial="hidden"
							animate="visible"
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5, delay: index * 0.15 }}
						>
							<Card>
								<Link
									to={`/beans/${bean.id}`}
									className="bean-details"
								>
									<CardBody>
										<h3>{bean.name}</h3>
										<p>
											{bean.country}, {bean.region}
										</p>
										<p className="roast-type">
											{bean.roast} roast
										</p>
										{closestRoastDate && (
											<p className="roast-date">
												Latest roast:{" "}
												{new Date(
													closestRoastDate
												).toLocaleDateString()}
											</p>
										)}
									</CardBody>
								</Link>
							</Card>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
}

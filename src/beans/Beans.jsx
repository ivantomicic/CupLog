import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loader from "../misc/Loader";
import { getBeans } from "../utils/supabase";
import { Card, CardBody } from "@heroui/react";

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
			{beans.map((bean) => {
				const closestRoastDate = getClosestRoastDate(bean.roast_dates);
				return (
					<Card key={bean.id}>
						<Link to={`/beans/${bean.id}`} className="bean-details">
							<CardBody>
								<h3>{bean.name}</h3>
								<p>
									{bean.country}, {bean.region}
								</p>
								<p className="roast-type">{bean.roast} roast</p>
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
				);
			})}
		</div>
	);
}

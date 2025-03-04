import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoasteries } from "../utils/supabase";
import { Card, CardBody } from "@heroui/react";
import Loader from "../misc/Loader";

export default function Roasteries() {
	// Query for fetching brewers with caching
	const {
		data: roasteries = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["roasteries"],
		queryFn: getRoasteries,
		staleTime: 30000, // Consider data fresh for 30 seconds
		cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
	});

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
			{roasteries.map((roastery) => (
				<Link key={roastery.id} to={`/roasteries/${roastery.id}`}>
					<Card>
						<CardBody>{roastery.name}</CardBody>
					</Card>
				</Link>
			))}
		</div>
	);
}

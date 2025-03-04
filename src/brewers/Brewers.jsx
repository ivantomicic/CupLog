import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBrewers } from "../utils/supabase";
import Loader from "../misc/Loader";

export default function Brewers() {
	// Query for fetching brewers with caching
	const {
		data: brewers = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["brewers"],
		queryFn: getBrewers,
		staleTime: 30000, // Consider data fresh for 30 seconds
		cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
	});

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<ul>
			{brewers.map((brewer) => (
				<li
					key={brewer.id}
					style={{
						marginBottom: "15px",
						display: "flex",
						alignItems: "center",
						gap: "10px",
					}}
				>
					<Link to={`/brewers/${brewer.id}`} style={{ flex: 1 }}>
						{brewer.name} - {brewer.type}
					</Link>
				</li>
			))}
		</ul>
	);
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loader from "../misc/Loader";
import { getGrinders } from "../utils/supabase";

export default function Grinders() {
	// Query for fetching grinders with caching
	const {
		data: grinders = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["grinders"],
		queryFn: getGrinders,
		staleTime: 30000, // Consider data fresh for 30 seconds
		cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
	});

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<ul>
			{grinders.map((grinder) => (
				<li
					key={grinder.id}
					style={{
						marginBottom: "15px",
						display: "flex",
						alignItems: "center",
						gap: "10px",
					}}
				>
					<Link to={`/grinders/${grinder.id}`} style={{ flex: 1 }}>
						{grinder.name} - {grinder.burr_size}&quot;{" "}
						{grinder.burr_type}
					</Link>
				</li>
			))}
		</ul>
	);
}

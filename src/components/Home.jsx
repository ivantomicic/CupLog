import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrews, deleteBrew } from "../utils/supabase-queries";
import Loader from "./Loader";
import CoffeeCard from "./CoffeeCard";

function Home() {
	const queryClient = useQueryClient();

	// Query for brews
	const {
		data: brews = [],
		error: brewsError,
		isInitialLoading: isLoadingBrews,
	} = useQuery({
		queryKey: ["brews"],
		queryFn: getBrews,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	// Mutation for deleting brews
	const deleteMutation = useMutation({
		mutationFn: deleteBrew,
		onSuccess: (_, brewId) => {
			queryClient.setQueryData(["brews"], (old) =>
				old?.filter((brew) => brew.id !== brewId)
			);
		},
	});

	if (brewsError) return <div>Error: {brewsError.message}</div>;
	if (isLoadingBrews) return <Loader />;

	return (
		<div>
			<h2>Latest Brews</h2>

			<br />
			<br />

			<ul className="coffee-cards">
				{brews.map((brew) => (
					<CoffeeCard
						key={brew.id}
						brew={brew}
						onDelete={async (brewId) => {
							try {
								await deleteMutation.mutateAsync(brewId);
							} catch (err) {
								console.error("Failed to delete brew:", err);
							}
						}}
						isDeleting={deleteMutation.isPending}
					/>
				))}
			</ul>
		</div>
	);
}

export default Home;

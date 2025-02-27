import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrews, deleteBrew } from "../utils/supabase";
import Loader from "./Loader";
import CoffeeCard from "./CoffeeCard";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

function Home() {
	const queryClient = useQueryClient();

	// Update the page header
	useUpdatePageHeader("Latest Brews", "/brews/new");

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

	console.log(brews);

	if (brewsError) return <div>Error: {brewsError.message}</div>;
	if (isLoadingBrews) return <Loader />;

	return (
		<>
			<main className="main-content">
				{brews.length === 0 ? (
					<div>No coffee logs available.</div>
				) : (
					<ul className="coffee-cards">
						{brews.map((brew) => (
							<CoffeeCard
								key={brew.id}
								brew={brew}
								onDelete={async (brewId) => {
									try {
										await deleteMutation.mutateAsync(
											brewId
										);
									} catch (err) {
										console.error(
											"Failed to delete brew:",
											err
										);
									}
								}}
								isDeleting={deleteMutation.isPending}
							/>
						))}
					</ul>
				)}
			</main>
		</>
	);
}

export default Home;

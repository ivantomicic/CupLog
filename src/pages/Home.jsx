import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrews, deleteBrew } from "@cuplog/utils/supabase";
import Loader from "@cuplog/misc/Loader";
import NewBrew from "@cuplog/brews/NewBrew";
import CoffeeCard from "@cuplog/misc/CoffeeCard";
import useUpdatePageHeader from "@cuplog/hooks/useUpdatePageHeader";
import { motion, AnimatePresence } from "framer-motion";

function Home() {
	const queryClient = useQueryClient();

	// Update the page header
	useUpdatePageHeader({
		title: "Latest Brews",
		actionComponent: <NewBrew />,
	});

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
		<>
			<main className="main-content">
				{brews.length === 0 ? (
					<div>No coffee logs available.</div>
				) : (
					<div className="coffee-cards">
						<AnimatePresence>
							{brews.map((brew) => (
								<motion.div
									key={brew.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{
										duration: 0.5,
										delay: brew.id * 0.1,
									}}
								>
									<CoffeeCard
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
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				)}
			</main>
		</>
	);
}

export default Home;

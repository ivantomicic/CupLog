import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrews, deleteBrew } from "../utils/supabase-queries";

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

	const handleDelete = async (e, brewId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this brew log?"
		);
		if (confirmDelete) {
			try {
				await deleteMutation.mutateAsync(brewId);
			} catch (err) {
				console.error("Failed to delete brew:", err);
			}
		}
	};

	if (brewsError) return <div>Error: {brewsError.message}</div>;
	if (isLoadingBrews) return <div>Loading...</div>;

	return (
		<div>
			<h2>Latest Brews</h2>
			<Link to="/brews/new">Log New Brew</Link>

			<br />
			<br />

			<ul>
				{brews.map((brew) => (
					<li key={brew.id}>
						<Link to={`/brews/${brew.id}`} style={{ flex: 1 }}>
							{brew.coffee?.name} -{" "}
							{new Date(brew.date).toLocaleString()} - {brew.dose}
							g in, {brew.yield}g out, {brew.brew_time}s
						</Link>
						{brew.notes && <p>Notes: {brew.notes}</p>}
						{brew.image_url && (
							<img
								src={brew.image_url}
								alt="Brew"
								style={{
									maxWidth: "100px",
									display: "block",
								}}
							/>
						)}
						<button
							onClick={(e) => handleDelete(e, brew.id)}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending
								? "Deleting..."
								: "Delete"}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Home;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, createBrewer, getBrewers } from "../utils/supabase";
import Loader from "../misc/Loader";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

export default function Brewers() {
	const queryClient = useQueryClient();
	const [newBrewer, setNewBrewer] = useState({
		name: "",
		type: "Pour Over",
		image: null,
	});

	// Update the page header
	useUpdatePageHeader("Brewers", "/brewers/new");

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

	// Mutation for creating brewers
	const createMutation = useMutation({
		mutationFn: async (brewerData) => {
			const user = await getCurrentUser();
			return createBrewer({
				...brewerData,
				user_id: user.id,
			});
		},
		onSuccess: (newBrewer) => {
			queryClient.setQueryData(["brewers"], (old) => [
				newBrewer,
				...(old || []),
			]);
		},
	});

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setNewBrewer((prev) => ({ ...prev, image: file }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync(newBrewer);
			setNewBrewer({
				name: "",
				type: "Pour Over",
				image: null,
			});
		} catch (err) {
			console.error("Failed to create brewer:", err);
		}
	};

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<form onSubmit={handleSubmit}>
			<div className="form-field">
				<label>Name:</label>
				<input
					type="text"
					value={newBrewer.name}
					onChange={(e) =>
						setNewBrewer({
							...newBrewer,
							name: e.target.value,
						})
					}
					required
					disabled={createMutation.isPending}
				/>
			</div>

			<div className="form-field">
				<label>
					Type:
					<select
						value={newBrewer.type}
						onChange={(e) =>
							setNewBrewer({
								...newBrewer,
								type: e.target.value,
							})
						}
						disabled={createMutation.isPending}
					>
						<option>Pour Over</option>
						<option>Espresso</option>
						<option>Immersion</option>
					</select>
				</label>
			</div>

			<div className="form-field full-width">
				<label>
					Image:
					<input
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						disabled={createMutation.isPending}
					/>
				</label>
			</div>

			<div className="form-field full-width">
				<button type="submit" disabled={createMutation.isPending}>
					{createMutation.isPending ? "Adding..." : "Add Brewer"}
				</button>
			</div>
		</form>
	);
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getRoasteries,
	createRoastery,
	deleteRoastery,
	getCurrentUser,
} from "../utils/supabase";
import Loader from "../misc/Loader";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

export default function Roasteries() {
	const queryClient = useQueryClient();

	const [newRoastery, setNewRoastery] = useState({
		name: "",
		logo: null,
	});

	// Update the page header
	useUpdatePageHeader("Roasteries");

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

	// Mutation for creating brewers
	const createMutation = useMutation({
		mutationFn: async (roasteryData) => {
			const user = await getCurrentUser();
			return createRoastery({
				...roasteryData,
				user_id: user.id,
			});
		},
		onSuccess: (newRoastery) => {
			queryClient.setQueryData(["roasteries"], (old) => [
				newRoastery,
				...(old || []),
			]);
		},
	});

	// Mutation for deleting roastery
	const deleteMutation = useMutation({
		mutationFn: deleteRoastery,
		onSuccess: (_, roasteryId) => {
			queryClient.setQueryData(["roasteries"], (old) =>
				old?.filter((roastery) => roastery.id !== roasteryId)
			);
		},
	});

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setNewRoastery((prev) => ({ ...prev, logo: file }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync(newRoastery);
			setNewRoastery({
				name: "",
				logo: null,
			});
		} catch (err) {
			console.error("Failed to create roastery:", err);
		}
	};

	const handleDelete = async (e, roasteryId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this roastery? This will affect any brew logs using this roastery."
		);
		if (confirmDelete) {
			try {
				await deleteMutation.mutateAsync(roasteryId);
			} catch (err) {
				console.error("Failed to delete roastery:", err);
			}
		}
	};

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div className="form-field  full-width">
					<label>Name:</label>
					<input
						type="text"
						value={newRoastery.name}
						onChange={(e) =>
							setNewRoastery({
								...newRoastery,
								name: e.target.value,
							})
						}
						required
						disabled={createMutation.isPending}
					/>
				</div>

				<div className="form-field full-width">
					<label>
						Logo:
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
						{createMutation.isPending
							? "Adding..."
							: "Add Roastery"}
					</button>
				</div>
			</form>

			<hr style={{ margin: "20px 0" }} />

			<ul>
				{roasteries.map((roastery) => (
					<li
						key={roastery.id}
						style={{
							marginBottom: "15px",
							display: "flex",
							alignItems: "center",
							gap: "10px",
						}}
					>
						<Link
							to={`/roasteries/${roastery.id}`}
							style={{ flex: 1 }}
						>
							{roastery.name}
						</Link>
						<button
							onClick={(e) => handleDelete(e, roastery.id)}
							disabled={deleteMutation.isPending}
							style={{
								backgroundColor: "#dc3545",
								color: "white",
								border: "none",
								padding: "5px 10px",
								borderRadius: "4px",
								cursor: deleteMutation.isPending
									? "not-allowed"
									: "pointer",
								minWidth: "70px",
								opacity: deleteMutation.isPending ? 0.7 : 1,
							}}
						>
							{deleteMutation.isPending
								? "Deleting..."
								: "Delete"}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}

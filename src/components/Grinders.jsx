import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getGrinders,
	createGrinder,
	deleteGrinder,
} from "../utils/supabase-queries";

export default function Grinders() {
	const queryClient = useQueryClient();
	const [newGrinder, setNewGrinder] = useState({
		name: "",
		burrSize: "",
		burrType: "",
		idealFor: "",
	});
	const [deletingIds, setDeletingIds] = useState(new Set());

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

	// Mutation for creating grinders
	const createMutation = useMutation({
		mutationFn: createGrinder,
		onSuccess: (newGrinder) => {
			queryClient.setQueryData(["grinders"], (old) => [
				newGrinder,
				...(old || []),
			]);
		},
	});

	// Mutation for deleting grinders
	const deleteMutation = useMutation({
		mutationFn: deleteGrinder,
		onSuccess: (_, grinderId) => {
			queryClient.setQueryData(["grinders"], (old) =>
				old?.filter((grinder) => grinder.id !== grinderId)
			);
		},
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync({
				name: newGrinder.name,
				burr_size: newGrinder.burrSize,
				burr_type: newGrinder.burrType,
				ideal_for: newGrinder.idealFor,
			});
			setNewGrinder({
				name: "",
				burrSize: "",
				burrType: "",
				idealFor: "",
			});
		} catch (err) {
			console.error("Failed to create grinder:", err);
		}
	};

	const handleDelete = async (e, grinderId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this grinder? This will affect any brew logs using this grinder."
		);
		if (confirmDelete) {
			setDeletingIds((prev) => new Set([...prev, grinderId]));
			try {
				await deleteMutation.mutateAsync(grinderId);
			} catch (err) {
				console.error("Failed to delete grinder:", err);
			} finally {
				setDeletingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(grinderId);
					return newSet;
				});
			}
		}
	};

	if (isInitialLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<h2>Grinders</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>
						Name:
						<input
							type="text"
							value={newGrinder.name}
							onChange={(e) =>
								setNewGrinder({
									...newGrinder,
									name: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Burr Size:
						<input
							type="text"
							value={newGrinder.burrSize}
							onChange={(e) =>
								setNewGrinder({
									...newGrinder,
									burrSize: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Burr Type:
						<input
							type="text"
							value={newGrinder.burrType}
							onChange={(e) =>
								setNewGrinder({
									...newGrinder,
									burrType: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Ideal For:
						<input
							type="text"
							value={newGrinder.idealFor}
							onChange={(e) =>
								setNewGrinder({
									...newGrinder,
									idealFor: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<button type="submit" disabled={createMutation.isPending}>
					{createMutation.isPending ? "Adding..." : "Add Grinder"}
				</button>
			</form>

			<div>
				<h3>Saved Grinders</h3>
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
							<Link
								to={`/grinders/${grinder.id}`}
								style={{ flex: 1 }}
							>
								{grinder.name} - {grinder.burr_size}&quot;{" "}
								{grinder.burr_type} - Ideal for:{" "}
								{grinder.ideal_for}
							</Link>
							<button
								onClick={(e) => handleDelete(e, grinder.id)}
								disabled={deletingIds.has(grinder.id)}
								style={{
									backgroundColor: "#dc3545",
									color: "white",
									border: "none",
									padding: "5px 10px",
									borderRadius: "4px",
									cursor: deletingIds.has(grinder.id)
										? "not-allowed"
										: "pointer",
									minWidth: "70px",
									opacity: deletingIds.has(grinder.id)
										? 0.7
										: 1,
								}}
							>
								{deletingIds.has(grinder.id)
									? "Deleting..."
									: "Delete"}
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getRoasteries,
	createRoastery,
	deleteRoastery,
	getCurrentUser,
} from "../utils/supabase";
import Input from "../components/Input";
import { Button } from "@heroui/react";
import Loader from "../misc/Loader";

export default function Roasteries() {
	const queryClient = useQueryClient();

	const [newRoastery, setNewRoastery] = useState({
		name: "",
		logo: null,
	});

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

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
			<Input
				label="Name"
				value={newRoastery.name}
				onChange={(e) =>
					setNewRoastery({
						...newRoastery,
						name: e.target.value,
					})
				}
				required
				disabled={createMutation.isPending}
				className="col-span-2"
			/>

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

			<Button
				type="submit"
				color="primary"
				disabled={createMutation.isPending}
				className="col-span-2"
			>
				{createMutation.isPending ? "Adding..." : "Add Roastery"}
			</Button>
		</form>
	);
}

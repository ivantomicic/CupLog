import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../misc/Loader";
import { createGrinder } from "../utils/supabase";

export default function Grinders() {
	const queryClient = useQueryClient();
	const [newGrinder, setNewGrinder] = useState({
		name: "",
		burrSize: "",
		burrType: "",
		idealFor: "",
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

	return (
		<form onSubmit={handleSubmit}>
			<div className="form-field">
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
			<div className="form-field">
				<label>
					Burr Size:
					<input
						type="number"
						inputMode="decimal"
						pattern="[0-9]*"
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
			<div className="form-field">
				<label>
					Burr Type:
					<select
						value={newGrinder.burrType}
						onChange={(e) =>
							setNewGrinder({
								...newGrinder,
								burrType: e.target.value,
							})
						}
						disabled={createMutation.isPending}
					>
						<option>Flat</option>
						<option>Conical</option>
					</select>
				</label>
			</div>
			<div className="form-field">
				<label>
					Ideal For:
					<select
						value={newGrinder.idealFor}
						onChange={(e) =>
							setNewGrinder({
								...newGrinder,
								idealFor: e.target.value,
							})
						}
						disabled={createMutation.isPending}
					>
						<option>All</option>
						<option>Pour Over</option>
						<option>Espresso</option>
					</select>
				</label>
			</div>
			<button type="submit" disabled={createMutation.isPending}>
				{createMutation.isPending ? "Adding..." : "Add Grinder"}
			</button>
		</form>
	);
}

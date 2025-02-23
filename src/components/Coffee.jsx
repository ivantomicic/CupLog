import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getCoffees,
	createCoffee,
	deleteCoffee,
	createRoastDate,
} from "../utils/supabase-queries";

// Helper function to get the closest roast date to today
const getClosestRoastDate = (roastDates) => {
	if (!roastDates || roastDates.length === 0) return null;
	const today = new Date();
	return roastDates.reduce((closest, current) => {
		const closestDate = new Date(closest.date);
		const currentDate = new Date(current.date);
		const closestDiff = Math.abs(today - closestDate);
		const currentDiff = Math.abs(today - currentDate);
		return currentDiff < closestDiff ? current : closest;
	});
};

export default function Coffee() {
	const queryClient = useQueryClient();
	const [newCoffee, setNewCoffee] = useState({
		name: "",
		country: "",
		region: "",
		farm: "",
		altitude: "",
		roast: "filter",
	});
	const [newRoastDate, setNewRoastDate] = useState("");

	// Query for fetching coffees with caching
	const {
		data: coffees = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["coffees"],
		queryFn: getCoffees,
		staleTime: 30000, // Consider data fresh for 30 seconds
		cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
	});

	// Mutation for creating coffee
	const createMutation = useMutation({
		mutationFn: async (coffeeData) => {
			const coffee = await createCoffee(coffeeData);
			if (newRoastDate) {
				await createRoastDate({
					coffee_id: coffee.id,
					date: newRoastDate,
				});
			}
			return coffee;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["coffees"]);
		},
	});

	// Mutation for deleting coffee
	const deleteMutation = useMutation({
		mutationFn: deleteCoffee,
		onSuccess: (_, coffeeId) => {
			queryClient.setQueryData(["coffees"], (old) =>
				old?.filter((coffee) => coffee.id !== coffeeId)
			);
		},
	});

	const handleDelete = async (e, coffeeId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this coffee? This will affect any brew logs using this coffee."
		);
		if (confirmDelete) {
			try {
				await deleteMutation.mutateAsync(coffeeId);
			} catch (err) {
				console.error("Failed to delete coffee:", err);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync({
				name: newCoffee.name,
				country: newCoffee.country,
				region: newCoffee.region,
				farm: newCoffee.farm,
				altitude: newCoffee.altitude,
				roast: newCoffee.roast,
			});

			// Reset form
			setNewCoffee({
				name: "",
				country: "",
				region: "",
				farm: "",
				altitude: "",
				roast: "filter",
			});
			setNewRoastDate("");
		} catch (err) {
			console.error("Failed to create coffee:", err);
		}
	};

	if (isInitialLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<h2>Coffee</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>
						Name:
						<input
							type="text"
							value={newCoffee.name}
							onChange={(e) =>
								setNewCoffee({
									...newCoffee,
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
						Country:
						<input
							type="text"
							value={newCoffee.country}
							onChange={(e) =>
								setNewCoffee({
									...newCoffee,
									country: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Region:
						<input
							type="text"
							value={newCoffee.region}
							onChange={(e) =>
								setNewCoffee({
									...newCoffee,
									region: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Farm:
						<input
							type="text"
							value={newCoffee.farm}
							onChange={(e) =>
								setNewCoffee({
									...newCoffee,
									farm: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Altitude:
						<input
							type="text"
							value={newCoffee.altitude}
							onChange={(e) =>
								setNewCoffee({
									...newCoffee,
									altitude: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Roast:
						<select
							value={newCoffee.roast}
							onChange={(e) =>
								setNewCoffee({
									...newCoffee,
									roast: e.target.value,
								})
							}
							disabled={createMutation.isPending}
						>
							<option>filter</option>
							<option>espresso</option>
							<option>omni</option>
						</select>
					</label>
				</div>
				<div>
					<label>
						Initial Roast Date:
						<input
							type="date"
							value={newRoastDate}
							onChange={(e) => setNewRoastDate(e.target.value)}
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<button type="submit" disabled={createMutation.isPending}>
					{createMutation.isPending ? "Adding..." : "Add Coffee"}
				</button>
			</form>

			<div>
				<h3>Saved Coffees</h3>
				<ul>
					{coffees.map((coffee) => {
						const closestRoastDate = getClosestRoastDate(
							coffee.roast_dates
						);
						return (
							<li
								key={coffee.id}
								style={{
									marginBottom: "15px",
									display: "flex",
									alignItems: "center",
									gap: "10px",
								}}
							>
								<Link
									to={`/coffee/${coffee.id}`}
									style={{ flex: 1 }}
								>
									{coffee.name} - {coffee.country},{" "}
									{coffee.region} - {coffee.roast} roast
									{closestRoastDate && (
										<div
											style={{
												fontSize: "0.9em",
												color: "#666",
											}}
										>
											Latest roast:{" "}
											{new Date(
												closestRoastDate.date
											).toLocaleDateString()}
										</div>
									)}
								</Link>
								<button
									onClick={(e) => handleDelete(e, coffee.id)}
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
										opacity: deleteMutation.isPending
											? 0.7
											: 1,
									}}
								>
									{deleteMutation.isPending
										? "Deleting..."
										: "Delete"}
								</button>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBrew,
	getCoffees,
	getGrinders,
	getBrewers,
	updateBrew,
	getBrews,
} from "../utils/supabase-queries";
import { analyzeBrewData } from "../utils/openai";

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

export default function NewBrew() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [newBrew, setNewBrew] = useState({
		coffeeId: "",
		date: new Date().toISOString().slice(0, 16),
		grinderId: "",
		grindSize: "",
		brewerId: "",
		brewTime: "",
		dose: "",
		yield: "",
		notes: "",
		image: null,
		aiSuggestions: null,
		roastDateId: "",
	});

	// Queries for all required data
	const { data: coffees = [], error: coffeesError } = useQuery({
		queryKey: ["coffees"],
		queryFn: getCoffees,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	const { data: grinders = [], error: grindersError } = useQuery({
		queryKey: ["grinders"],
		queryFn: getGrinders,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	const { data: brewers = [], error: brewersError } = useQuery({
		queryKey: ["brewers"],
		queryFn: getBrewers,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	// Mutation for creating brews
	const createMutation = useMutation({
		mutationFn: async (brewData) => {
			// First create the brew without AI suggestions
			const brew = await createBrew(brewData);

			try {
				// Get the full brew data with relationships for AI analysis
				const brews = await getBrews();
				const brewWithRelations = brews.find((b) => b.id === brew.id);

				if (!brewWithRelations) {
					throw new Error("Failed to load brew data for analysis");
				}

				const aiSuggestions = await analyzeBrewData(brewWithRelations);

				// Update the brew with AI suggestions
				const updatedBrew = await updateBrew(brew.id, {
					...brew,
					ai_suggestions: aiSuggestions,
				});

				return updatedBrew;
			} catch (aiError) {
				console.error("AI analysis failed:", aiError);
				return brew;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["brews"]);
			navigate("/"); // Redirect to home after successful creation
		},
	});

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setNewBrew((prev) => ({ ...prev, image: file }));
		}
	};

	const handleCoffeeChange = (e) => {
		const coffeeId = e.target.value;
		const selectedCoffee = coffees.find((c) => c.id === coffeeId);
		let latestRoastDateId = "";

		if (
			selectedCoffee &&
			selectedCoffee.roast_dates &&
			selectedCoffee.roast_dates.length > 0
		) {
			const closestRoastDate = getClosestRoastDate(
				selectedCoffee.roast_dates
			);
			latestRoastDateId = closestRoastDate.id;
		}

		setNewBrew((prev) => ({
			...prev,
			coffeeId,
			roastDateId: latestRoastDateId,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync(newBrew);
		} catch (err) {
			console.error("Failed to create brew:", err);
		}
	};

	// Combine all errors
	const error = coffeesError || grindersError || brewersError;
	if (error) return <div>Error: {error.message}</div>;

	const selectedCoffee = coffees.find((c) => c.id === newBrew.coffeeId);

	return (
		<div>
			<h2>Log New Brew</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>
						Coffee:
						<select
							value={newBrew.coffeeId}
							onChange={handleCoffeeChange}
							required
							disabled={createMutation.isPending}
						>
							<option value="">Select Coffee</option>
							{coffees.map((coffee) => {
								const closestRoastDate =
									coffee.roast_dates?.length > 0
										? getClosestRoastDate(
												coffee.roast_dates
										  )
										: null;
								return (
									<option key={coffee.id} value={coffee.id}>
										{coffee.name} -{" "}
										{closestRoastDate
											? `Latest roast: ${new Date(
													closestRoastDate.date
											  ).toLocaleDateString()}`
											: "No roast dates"}
									</option>
								);
							})}
						</select>
					</label>
				</div>

				{selectedCoffee &&
					selectedCoffee.roast_dates &&
					selectedCoffee.roast_dates.length > 0 && (
						<div>
							<label>
								Roast Date:
								<select
									value={newBrew.roastDateId}
									onChange={(e) =>
										setNewBrew({
											...newBrew,
											roastDateId: e.target.value,
										})
									}
									required
									disabled={createMutation.isPending}
								>
									<option value="">Select Roast Date</option>
									{[...selectedCoffee.roast_dates]
										.sort(
											(a, b) =>
												Math.abs(
													new Date() -
														new Date(a.date)
												) -
												Math.abs(
													new Date() -
														new Date(b.date)
												)
										)
										.map((roastDate) => {
											const isClosest =
												roastDate ===
												getClosestRoastDate(
													selectedCoffee.roast_dates
												);
											return (
												<option
													key={roastDate.id}
													value={roastDate.id}
												>
													{new Date(
														roastDate.date
													).toLocaleDateString()}
													{isClosest
														? " (Latest)"
														: ""}
												</option>
											);
										})}
								</select>
							</label>
						</div>
					)}

				<div>
					<label>
						Date:
						<input
							type="datetime-local"
							value={newBrew.date}
							onChange={(e) =>
								setNewBrew({ ...newBrew, date: e.target.value })
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Grinder:
						<select
							value={newBrew.grinderId}
							onChange={(e) =>
								setNewBrew({
									...newBrew,
									grinderId: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						>
							<option value="">Select Grinder</option>
							{grinders.map((grinder) => (
								<option key={grinder.id} value={grinder.id}>
									{grinder.name}
								</option>
							))}
						</select>
					</label>
				</div>
				<div>
					<label>
						Grind Size:
						<input
							type="text"
							value={newBrew.grindSize}
							onChange={(e) =>
								setNewBrew({
									...newBrew,
									grindSize: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Brewer:
						<select
							value={newBrew.brewerId}
							onChange={(e) =>
								setNewBrew({
									...newBrew,
									brewerId: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						>
							<option value="">Select Brewer</option>
							{brewers.map((brewer) => (
								<option key={brewer.id} value={brewer.id}>
									{brewer.name}
								</option>
							))}
						</select>
					</label>
				</div>
				<div>
					<label>
						Brew Time (seconds):
						<input
							type="number"
							value={newBrew.brewTime}
							onChange={(e) =>
								setNewBrew({
									...newBrew,
									brewTime: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Dose (g):
						<input
							type="number"
							step="0.1"
							value={newBrew.dose}
							onChange={(e) =>
								setNewBrew({ ...newBrew, dose: e.target.value })
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Yield (g):
						<input
							type="number"
							step="0.1"
							value={newBrew.yield}
							onChange={(e) =>
								setNewBrew({
									...newBrew,
									yield: e.target.value,
								})
							}
							required
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
					<label>
						Notes:
						<textarea
							value={newBrew.notes}
							onChange={(e) =>
								setNewBrew({
									...newBrew,
									notes: e.target.value,
								})
							}
							rows="4"
							disabled={createMutation.isPending}
						/>
					</label>
				</div>
				<div>
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
				<button type="submit" disabled={createMutation.isPending}>
					{createMutation.isPending
						? "Logging Brew and Analyzing..."
						: "Log Brew"}
				</button>
			</form>

			{createMutation.isPending && (
				<div>
					<h3>AI Analysis in Progress</h3>
					<p>Analyzing your brew data... Please wait.</p>
				</div>
			)}
		</div>
	);
}

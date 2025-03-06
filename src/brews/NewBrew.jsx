import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createBrew,
	getBeans,
	getGrinders,
	getBrewers,
	updateBrew,
	getBrews,
} from "../utils/supabase";
import { analyzeBrewData } from "../utils/openai";
import { Input, Select, DatePicker, Drawer } from "@cuplog/components";
import { Button } from "@heroui/react";
import { FiPlusCircle } from "react-icons/fi";

// Helper function to get the closest roast date to today
const getClosestRoastDate = (roastDates) => {
	if (!roastDates || roastDates.length === 0) return null;
	const today = new Date();
	return roastDates.reduce((closest, current) => {
		const closestDate = new Date(closest);
		const currentDate = new Date(current);
		const closestDiff = Math.abs(today - closestDate);
		const currentDiff = Math.abs(today - currentDate);
		return currentDiff < closestDiff ? current : closest;
	});
};

// Set this to false to skip AI analysis
const ENABLE_AI_ANALYSIS = false;

export default function NewBrew() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [newBrew, setNewBrew] = useState({
		beansId: "",
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
		roastDate: "",
	});

	console.log(newBrew);

	// Update the page header
	// useUpdatePageHeader("Log New Brew");

	// Queries for all required data
	const { data: beans = [], error: beansError } = useQuery({
		queryKey: ["beans"],
		queryFn: getBeans,
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

			// Skip AI analysis if disabled
			if (!ENABLE_AI_ANALYSIS) {
				return brew;
			}

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

	const handleBeansChange = (e) => {
		const beansId = e.target.value;
		const selectedBeans = beans.find((b) => b.id === beansId);
		let selectedRoastDate = "";

		if (
			selectedBeans &&
			selectedBeans.roast_dates &&
			selectedBeans.roast_dates.length > 0
		) {
			const closestRoastDate = getClosestRoastDate(
				selectedBeans.roast_dates
			);
			selectedRoastDate = closestRoastDate;
		}

		setNewBrew((prev) => ({
			...prev,
			beansId,
			roastDate: selectedRoastDate,
		}));
	};

	const handleRoastDateChange = (e) => {
		const roastDate = e.target.value;
		setNewBrew((prev) => ({
			...prev,
			roastDate,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await createMutation.mutateAsync({
				...newBrew,
			});
		} catch (err) {
			console.error("Failed to create brew:", err);
		}
	};

	// Combine all errors
	const error = beansError || grindersError || brewersError;
	if (error) return <div>Error: {error.message}</div>;

	const selectedBeans = beans.find((b) => b.id === newBrew.beansId);

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const handleDrawerClose = () => {
		setIsDrawerOpen(false);
	};

	return (
		<>
			<Button
				color="primary"
				startContent={<FiPlusCircle />}
				onPress={() => setIsDrawerOpen(true)}
			>
				Log
			</Button>

			<Drawer
				isOpen={isDrawerOpen}
				onClose={handleDrawerClose}
				title="Log New Brew"
			>
				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-2 gap-4"
				>
					<Select
						label="Select Beans"
						value={newBrew.beansId}
						options={beans.map((beans) => {
							const closestRoastDate =
								beans.roast_dates?.length > 0
									? getClosestRoastDate(beans.roast_dates)
									: null;
							return {
								key: beans.id,
								label: beans.name,
							};
						})}
						onChange={handleBeansChange}
					/>

					{selectedBeans &&
						selectedBeans.roast_dates &&
						selectedBeans.roast_dates.length > 0 && (
							<Select
								label="Roast Date"
								value={newBrew.roastDate}
								options={[...selectedBeans.roast_dates]
									.sort(
										(a, b) =>
											Math.abs(new Date() - new Date(a)) -
											Math.abs(new Date() - new Date(b))
									)
									.map((roastDate) => {
										const isClosest =
											roastDate ===
											getClosestRoastDate(
												selectedBeans.roast_dates
											);
										return {
											key: roastDate,
											label:
												new Date(roastDate)
													.toLocaleDateString(
														"en-GB",
														{
															day: "2-digit",
															month: "2-digit",
															year: "numeric",
														}
													)
													.replace(/\//g, " / ") +
												(isClosest
													? " (Freshest)"
													: ""),
										};
									})}
								onChange={handleRoastDateChange}
							/>
						)}

					<DatePicker
						label="Date & Time"
						allowTimePicker
						onChange={(x) => {
							setNewBrew({
								...newBrew,
								date: x,
							});
						}}
						className="col-span-2"
					/>

					<Select
						label="Grinders"
						value={newBrew.grinderId}
						options={grinders.map((grinder) => ({
							key: grinder.id,
							label: grinder.name,
						}))}
						onChange={(e) =>
							setNewBrew({
								...newBrew,
								grinderId: e.target.value,
							})
						}
						required
						disabled={createMutation.isPending}
					/>

					<Input
						label="Grind Size"
						value={newBrew.grindSize}
						suffix="mm"
						onChange={(e) =>
							setNewBrew({
								...newBrew,
								grindSize: e.target.value,
							})
						}
						type="number"
						pattern="[0-9]*"
						inputMode="decimal"
						disabled={createMutation.isPending}
					/>

					<Select
						label="Brewer"
						value={newBrew.brewerId}
						options={brewers.map((brewer) => ({
							key: brewer.id,
							label: brewer.name,
						}))}
						onChange={(e) =>
							setNewBrew({
								...newBrew,
								brewerId: e.target.value,
							})
						}
						required
						disabled={createMutation.isPending}
					/>

					<Input
						label="Brew Time"
						value={newBrew.brewTime}
						suffix="sec"
						onChange={(e) =>
							setNewBrew({
								...newBrew,
								brewTime: e.target.value,
							})
						}
						type="number"
						pattern="[0-9]*"
						disabled={createMutation.isPending}
					/>

					<Input
						label="Dose"
						value={newBrew.dose}
						suffix="g"
						onChange={(e) =>
							setNewBrew({ ...newBrew, dose: e.target.value })
						}
						type="number"
						pattern="[0-9]*"
						disabled={createMutation.isPending}
					/>

					<Input
						label="Yield"
						value={newBrew.yield}
						suffix="g"
						onChange={(e) =>
							setNewBrew({ ...newBrew, yield: e.target.value })
						}
						type="number"
						pattern="[0-9]*"
						disabled={createMutation.isPending}
					/>

					<div
						className="form-field full-width"
						style={{ display: "none" }}
					>
						<label>Notes:</label>
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
					</div>

					<div
						className="form-field full-width"
						style={{ display: "none" }}
					>
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

					<Button
						color="primary"
						type="submit"
						disabled={createMutation.isPending}
						className="col-span-2"
					>
						{createMutation.isPending
							? ENABLE_AI_ANALYSIS
								? "Logging Brew and Analyzing..."
								: "Logging Brew..."
							: "Log Brew"}
					</Button>
				</form>
				{createMutation.isPending && ENABLE_AI_ANALYSIS && (
					<div>
						<h3>AI Analysis in Progress</h3>
						<p>Analyzing your brew data... Please wait.</p>
					</div>
				)}
			</Drawer>
		</>
	);
}

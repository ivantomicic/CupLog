import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "./Loader";
import PropTypes from "prop-types";
import {
	getCoffees,
	createCoffee,
	deleteCoffee,
	createRoastDate,
} from "../utils/supabase-queries";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

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

function AddCoffeeModal({ isOpen, onClose }) {
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
			onClose();
		},
	});

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

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Add New Coffee</h2>
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
								onChange={(e) =>
									setNewRoastDate(e.target.value)
								}
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div className="modal-actions">
						<button type="button" onClick={onClose}>
							Cancel
						</button>
						<button
							type="submit"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending
								? "Adding..."
								: "Add Coffee"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

AddCoffeeModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default function Coffee() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const queryClient = useQueryClient();

	// Update the page header
	useUpdatePageHeader("Coffee");

	// Query for fetching coffees with caching
	const {
		data: coffees = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["coffees"],
		queryFn: getCoffees,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
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

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<>
			<main className="main-content">
				<button
					className="add-button"
					onClick={() => setIsModalOpen(true)}
				>
					Add Coffee
				</button>

				<div className="coffee-list">
					{coffees.map((coffee) => {
						const closestRoastDate = getClosestRoastDate(
							coffee.roast_dates
						);
						return (
							<div key={coffee.id} className="coffee-item">
								<Link
									to={`/coffee/${coffee.id}`}
									className="coffee-details"
								>
									<h3>{coffee.name}</h3>
									<p>
										{coffee.country}, {coffee.region}
									</p>
									<p className="roast-type">
										{coffee.roast} roast
									</p>
									{closestRoastDate && (
										<p className="roast-date">
											Latest roast:{" "}
											{new Date(
												closestRoastDate.date
											).toLocaleDateString()}
										</p>
									)}
								</Link>
								<button
									onClick={(e) => handleDelete(e, coffee.id)}
									disabled={deleteMutation.isPending}
									className="delete-button"
								>
									{deleteMutation.isPending
										? "Deleting..."
										: "Delete"}
								</button>
							</div>
						);
					})}
				</div>

				<AddCoffeeModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			</main>
		</>
	);
}

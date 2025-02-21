import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
	const [coffees, setCoffees] = useState([]);
	const [newCoffee, setNewCoffee] = useState({
		name: "",
		country: "",
		region: "",
		farm: "",
		altitude: "",
		roast: "filter",
		roastDates: [],
	});
	const [newRoastDate, setNewRoastDate] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadCoffees();
	}, []);

	const loadCoffees = async () => {
		try {
			const data = await getCoffees();
			setCoffees(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (e, coffeeId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this coffee? This will affect any brew logs using this coffee."
		);
		if (confirmDelete) {
			try {
				await deleteCoffee(coffeeId);
				setCoffees(coffees.filter((coffee) => coffee.id !== coffeeId));
			} catch (err) {
				setError(err.message);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		try {
			// First create the coffee without roast dates
			const coffee = await createCoffee({
				name: newCoffee.name,
				country: newCoffee.country,
				region: newCoffee.region,
				farm: newCoffee.farm,
				altitude: newCoffee.altitude,
				roast: newCoffee.roast,
			});

			// If there's a roast date, create it in the roast_dates table
			if (newRoastDate) {
				// You'll need to create a new function in supabase-queries.js for this
				await createRoastDate({
					coffee_id: coffee.id,
					date: newRoastDate,
				});
			}

			// Reload coffees to get the updated data with relationships
			await loadCoffees();

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
			setError(err.message);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

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
						/>
					</label>
				</div>
				<button type="submit">Add Coffee</button>
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
									style={{
										backgroundColor: "#dc3545",
										color: "white",
										border: "none",
										padding: "5px 10px",
										borderRadius: "4px",
										cursor: "pointer",
										minWidth: "70px",
									}}
								>
									Delete
								</button>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

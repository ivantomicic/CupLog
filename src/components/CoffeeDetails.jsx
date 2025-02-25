import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	getCoffees,
	updateCoffee,
	createRoastDate,
	deleteRoastDate,
} from "../utils/supabase-queries";
import { v4 as uuidv4 } from "uuid";
import Loader from "./Loader";

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

export default function CoffeeDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [coffee, setCoffee] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedCoffee, setEditedCoffee] = useState(null);
	const [newRoastDate, setNewRoastDate] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadCoffee();
	}, [id]);

	const loadCoffee = async () => {
		try {
			const coffees = await getCoffees();
			const coffee = coffees.find((c) => c.id === id);
			setCoffee(coffee);
			setEditedCoffee(coffee);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			const updatedCoffee = await updateCoffee(id, {
				name: editedCoffee.name,
				country: editedCoffee.country,
				region: editedCoffee.region,
				farm: editedCoffee.farm,
				altitude: editedCoffee.altitude,
				roast: editedCoffee.roast,
			});
			await loadCoffee(); // Reload to get updated data with relationships
			setIsEditing(false);
		} catch (err) {
			setError(err.message);
		}
	};

	const handleAddRoastDate = async () => {
		if (!newRoastDate || !isEditing) return;

		try {
			await createRoastDate({
				coffee_id: id,
				date: newRoastDate,
			});
			setNewRoastDate("");
			await loadCoffee(); // Reload to get updated data
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDeleteRoastDate = async (roastDateId) => {
		if (!isEditing) return;

		try {
			await deleteRoastDate(roastDateId);
			await loadCoffee(); // Reload to get updated data
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) return <Loader />;
	if (error) return <div>Error: {error}</div>;
	if (!coffee) return <div>Coffee not found</div>;

	return (
		<div>
			<button onClick={() => navigate("/coffee")}>Back to Coffee</button>
			<h2>Coffee Details</h2>

			{isEditing ? (
				<div>
					<div>
						<label>
							Name:
							<input
								type="text"
								value={editedCoffee.name}
								onChange={(e) =>
									setEditedCoffee({
										...editedCoffee,
										name: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Country:
							<input
								type="text"
								value={editedCoffee.country}
								onChange={(e) =>
									setEditedCoffee({
										...editedCoffee,
										country: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Region:
							<input
								type="text"
								value={editedCoffee.region}
								onChange={(e) =>
									setEditedCoffee({
										...editedCoffee,
										region: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Farm:
							<input
								type="text"
								value={editedCoffee.farm}
								onChange={(e) =>
									setEditedCoffee({
										...editedCoffee,
										farm: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Altitude:
							<input
								type="text"
								value={editedCoffee.altitude}
								onChange={(e) =>
									setEditedCoffee({
										...editedCoffee,
										altitude: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Roast:
							<select
								value={editedCoffee.roast}
								onChange={(e) =>
									setEditedCoffee({
										...editedCoffee,
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
					<button onClick={handleSave}>Save</button>
					<button onClick={() => setIsEditing(false)}>Cancel</button>
				</div>
			) : (
				<div>
					<p>Name: {coffee.name}</p>
					<p>Country: {coffee.country}</p>
					<p>Region: {coffee.region}</p>
					<p>Farm: {coffee.farm}</p>
					<p>Altitude: {coffee.altitude}</p>
					<p>Roast: {coffee.roast}</p>
					<button onClick={() => setIsEditing(true)}>Edit</button>
				</div>
			)}

			<div style={{ marginTop: "2rem" }}>
				<h3>Roast Dates</h3>
				{isEditing && (
					<div style={{ marginBottom: "1rem" }}>
						<input
							type="date"
							value={newRoastDate}
							onChange={(e) => setNewRoastDate(e.target.value)}
						/>
						<button
							onClick={handleAddRoastDate}
							style={{ marginLeft: "10px" }}
						>
							Add Roast Date
						</button>
					</div>
				)}

				<ul style={{ listStyle: "none", padding: 0 }}>
					{(coffee.roast_dates || [])
						.sort(
							(a, b) =>
								Math.abs(new Date() - new Date(a.date)) -
								Math.abs(new Date() - new Date(b.date))
						)
						.map((roastDate) => {
							const isClosest =
								roastDate ===
								getClosestRoastDate(coffee.roast_dates);
							return (
								<li
									key={roastDate.id}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "10px",
										marginBottom: "8px",
										padding: "8px",
										backgroundColor: isClosest
											? "#e6f3ff"
											: "#f5f5f5",
										borderRadius: "4px",
									}}
								>
									<span>
										{new Date(
											roastDate.date
										).toLocaleDateString()}
										{isClosest && (
											<span
												style={{
													marginLeft: "8px",
													color: "#0066cc",
												}}
											>
												(Latest)
											</span>
										)}
									</span>
									{isEditing && (
										<button
											onClick={() =>
												handleDeleteRoastDate(
													roastDate.id
												)
											}
											style={{
												marginLeft: "auto",
												backgroundColor: "#dc3545",
												color: "white",
												border: "none",
												padding: "4px 8px",
												borderRadius: "4px",
												cursor: "pointer",
											}}
										>
											Delete
										</button>
									)}
								</li>
							);
						})}
				</ul>
			</div>
		</div>
	);
}

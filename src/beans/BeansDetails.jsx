import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
	getBeans,
	updateBean,
	addRoastDate,
	removeRoastDate,
} from "../utils/supabase";
import Loader from "../misc/Loader";
import { usePageHeader } from "../context/PageHeaderContext";

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

export default function BeansDetails() {
	const { id } = useParams();
	const [bean, setBean] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedBean, setEditedBean] = useState(null);
	const [newRoastDate, setNewRoastDate] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const { updateHeader } = usePageHeader();

	useEffect(() => {
		loadBean();
	}, [id]);

	const loadBean = async () => {
		try {
			const beans = await getBeans();
			const bean = beans.find((c) => c.id === id);
			setBean(bean);
			setEditedBean(bean);

			// Update the page header with the bean name
			if (bean?.name) {
				updateHeader({
					title: `${bean.name} Bean`,
				});
			} else {
				updateHeader({ title: "Bean Details" });
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Add this effect to update header when editing state changes
	useEffect(() => {
		if (bean?.name) {
			const title = `${bean.name} Bean`;
			updateHeader({ title });
		}
	}, [isEditing, bean?.name, updateHeader]);

	const handleSave = async () => {
		try {
			await updateBean(id, {
				name: editedBean.name,
				country: editedBean.country,
				region: editedBean.region,
				farm: editedBean.farm,
				altitude: editedBean.altitude,
				roast: editedBean.roast,
				// Keep the existing roast_dates
				roast_dates: bean.roast_dates || [],
			});
			await loadBean(); // Reload to get updated data with relationships
			setIsEditing(false);

			// Update header to remove "Editing" prefix
			if (editedBean.name) {
				updateHeader({ title: `${editedBean.name} Bean` });
			}
		} catch (err) {
			setError(err.message);
		}
	};

	const handleAddRoastDate = async () => {
		if (!newRoastDate || !isEditing) return;

		try {
			await addRoastDate(id, newRoastDate);
			setNewRoastDate("");
			await loadBean(); // Reload to get updated data
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDeleteRoastDate = async (dateToRemove) => {
		if (!isEditing) return;

		try {
			await removeRoastDate(id, dateToRemove);
			await loadBean(); // Reload to get updated data
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) return <Loader />;
	if (error) return <div>Error: {error}</div>;
	if (!bean) return <div>Bean not found</div>;

	return (
		<main className="main-content">
			{isEditing ? (
				<div>
					<div>
						<label>
							Name:
							<input
								type="text"
								value={editedBean.name}
								onChange={(e) =>
									setEditedBean({
										...editedBean,
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
								value={editedBean.country}
								onChange={(e) =>
									setEditedBean({
										...editedBean,
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
								value={editedBean.region}
								onChange={(e) =>
									setEditedBean({
										...editedBean,
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
								value={editedBean.farm}
								onChange={(e) =>
									setEditedBean({
										...editedBean,
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
								value={editedBean.altitude}
								onChange={(e) =>
									setEditedBean({
										...editedBean,
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
								value={editedBean.roast}
								onChange={(e) =>
									setEditedBean({
										...editedBean,
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
					<p>Name: {bean.name}</p>
					<p>Country: {bean.country}</p>
					<p>Region: {bean.region}</p>
					<p>Farm: {bean.farm}</p>
					<p>Altitude: {bean.altitude}</p>
					<p>Roast: {bean.roast}</p>
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
					{(bean.roast_dates || [])
						.sort(
							(a, b) =>
								Math.abs(new Date() - new Date(a)) -
								Math.abs(new Date() - new Date(b))
						)
						.map((roastDate) => {
							const isClosest =
								roastDate ===
								getClosestRoastDate(bean.roast_dates);
							return (
								<li
									key={roastDate}
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
											roastDate
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
												handleDeleteRoastDate(roastDate)
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
		</main>
	);
}

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBrews, updateBrew, deleteBrew } from "../utils/supabase";
import { analyzeBrewData } from "../utils/openai";
import Loader from "../misc/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { usePageHeader } from "../context/PageHeaderContext";
import { Card, CardHeader, CardBody, CardFooter, Divider } from "@heroui/react";

// Helper function to format date for datetime-local input
const formatDateForInput = (dateString) => {
	const date = new Date(dateString);
	return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
};

export default function BrewDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [brew, setBrew] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedBrew, setEditedBrew] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const queryClient = useQueryClient();
	const { updateHeader } = usePageHeader();
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		loadBrew();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const loadBrew = async () => {
		try {
			const brews = await getBrews();
			const brew = brews.find((b) => b.id === id);

			if (isMounted.current) {
				if (!brew) {
					setError("Brew not found");
					return;
				}
				setBrew(brew);

				// Update the page header with the bean name
				if (brew.beans?.name) {
					updateHeader({
						title: `${brew.beans.name} Brew`,
					});
				} else {
					updateHeader({ title: "Brew Details" });
				}

				setEditedBrew({
					...brew,
					beans_id: brew.beans?.id,
					grinder_id: brew.grinder?.id,
					brewer_id: brew.brewer?.id,
					roast_date_id: brew.roast_date_id,
					date: formatDateForInput(brew.date),
				});
			}
		} catch (err) {
			if (isMounted.current) {
				setError(err.message);
			}
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	};

	const handleSave = async () => {
		try {
			setError(null);

			// Update the brew
			await updateBrew(id, editedBrew);

			// Reload the brew to get the updated data
			await loadBrew();
			setIsEditing(false);

			// Update header to remove "Editing" prefix
			if (brew.beans?.name) {
				updateHeader({ title: `${brew.beans.name} Brew` });
			}
		} catch (err) {
			setError(err.message);
		}
	};

	const handleAnalyze = async () => {
		try {
			setIsAnalyzing(true);
			setError(null);

			// Get the latest brew data with relationships
			const brews = await getBrews();
			const currentBrew = brews.find((b) => b.id === id);

			if (!currentBrew) {
				throw new Error("Failed to load brew data");
			}

			console.log("Sending brew data for analysis:", currentBrew);

			// Get AI analysis
			const aiSuggestions = await analyzeBrewData(currentBrew);

			console.log("Received AI suggestions:", aiSuggestions);

			// Update the brew with new AI suggestions
			await updateBrew(id, {
				...currentBrew,
				ai_suggestions: aiSuggestions,
			});

			// Reload to get the latest data
			await loadBrew();
		} catch (err) {
			console.error("Error in handleAnalyze:", err);
			setError(err.message);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setEditedBrew((prev) => ({ ...prev, image: file }));
		}
	};

	const handleFlowChartChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setEditedBrew((prev) => ({ ...prev, flow_chart: file }));
		}
	};

	const handleDelete = async () => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this brew log?"
		);

		if (confirmDelete) {
			try {
				await deleteBrew(id);
				await queryClient.invalidateQueries({ queryKey: ["brews"] });
				navigate("/brews");
			} catch (err) {
				setError(err.message);
			}
		}
	};

	// Update header when editing state changes
	useEffect(() => {
		if (brew?.beans?.name) {
			const title = isEditing
				? `Editing: ${brew.beans.name} Brew`
				: `${brew.beans.name} Brew`;
			updateHeader({ title });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing, brew?.beans?.name]);

	if (loading) return <Loader />;
	if (!brew) return <div>Brew not found</div>;

	// Find the selected roast date from bean's roast dates
	const selectedRoastDate = brew.roast_date;

	return (
		<>
			{brew.image_url && (
				<img
					src={brew.image_url}
					alt="Brew"
					className="w-full aspect-video object-cover"
				/>
			)}
			<main className="main-content w-content-inside">
				{error && (
					<div
						className="error-container"
						style={{
							padding: "1rem",
							backgroundColor: "#ffebee",
							border: "1px solid #f44336",
							borderRadius: "4px",
							margin: "1rem 0",
						}}
					>
						<h3>Error</h3>
						<p>{error}</p>
						<button onClick={() => setError(null)}>Dismiss</button>
					</div>
				)}

				{isEditing ? (
					<div>
						<div>
							<label>
								Beans:
								<select
									value={editedBrew.beans_id}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											beans_id: e.target.value,
										})
									}
									disabled
								>
									<option value={brew.beans?.id}>
										{brew.beans?.name}
									</option>
								</select>
							</label>
						</div>

						{brew.beans?.roast_dates &&
							brew.beans.roast_dates.length > 0 && (
								<div>
									<label>
										Roast Date:
										<select
											value={editedBrew.roast_date}
											onChange={(e) =>
												setEditedBrew({
													...editedBrew,
													roast_date: e.target.value,
												})
											}
										>
											{brew.beans.roast_dates.map(
												(roastDate) => (
													<option
														key={roastDate}
														value={roastDate}
													>
														{new Date(
															roastDate
														).toLocaleDateString()}
													</option>
												)
											)}
										</select>
									</label>
								</div>
							)}

						<div>
							<label>
								Date:
								<input
									type="datetime-local"
									value={editedBrew.date}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											date: e.target.value,
										})
									}
								/>
							</label>
						</div>
						<div>
							<label>
								Grinder:
								<select
									value={editedBrew.grinder_id}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											grinder_id: e.target.value,
										})
									}
									disabled // Disable for now as we need to load all grinders
								>
									<option value={brew.grinder?.id}>
										{brew.grinder?.name}
									</option>
								</select>
							</label>
						</div>
						<div>
							<label>
								Grind Size:
								<input
									type="text"
									value={editedBrew.grind_size}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											grind_size: e.target.value,
										})
									}
								/>
							</label>
						</div>
						<div>
							<label>
								Brewer:
								<select
									value={editedBrew.brewer_id}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											brewer_id: e.target.value,
										})
									}
									disabled // Disable for now as we need to load all brewers
								>
									<option value={brew.brewer?.id}>
										{brew.brewer?.name}
									</option>
								</select>
							</label>
						</div>
						<div>
							<label>
								Brew Time (seconds):
								<input
									type="number"
									value={editedBrew.brew_time}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											brew_time: e.target.value,
										})
									}
								/>
							</label>
						</div>
						<div>
							<label>
								Dose (g):
								<input
									type="number"
									step="0.1"
									value={editedBrew.dose}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											dose: e.target.value,
										})
									}
								/>
							</label>
						</div>
						<div>
							<label>
								Yield (g):
								<input
									type="number"
									step="0.1"
									value={editedBrew.yield}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											yield: e.target.value,
										})
									}
								/>
							</label>
						</div>
						<div>
							<label>
								Notes:
								<textarea
									value={editedBrew.notes}
									onChange={(e) =>
										setEditedBrew({
											...editedBrew,
											notes: e.target.value,
										})
									}
									rows="4"
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
								/>
							</label>
							{editedBrew.image_url && (
								<div>
									<p>Current image:</p>
									<img
										src={editedBrew.image_url}
										alt="Current brew"
										style={{ maxWidth: "200px" }}
									/>
								</div>
							)}
						</div>
						<div>
							<label>
								Flow Chart:
								<input
									type="file"
									accept="image/*"
									onChange={handleFlowChartChange}
								/>
							</label>
							{editedBrew.flow_chart_url && (
								<div>
									<p>Current flow chart:</p>
									<img
										src={editedBrew.flow_chart_url}
										alt="Flow chart"
										style={{ maxWidth: "200px" }}
									/>
								</div>
							)}
						</div>
						<button onClick={handleSave}>Save</button>
						<button onClick={() => setIsEditing(false)}>
							Cancel
						</button>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4">
						<Card className="col-span-2">
							<CardBody>
								<div className="flex justify-around">
									<div>
										<p className="value">{brew.dose}g</p>
										<p className="label">Dose</p>
									</div>
									<div>
										<p className="value">{brew.yield}g</p>
										<p className="label">Yield</p>
									</div>
									<div>
										<p className="value">
											{brew.brew_time}s
										</p>
										<p className="label">Brew Time</p>
									</div>
									<div>
										<p className="value">94°C</p>
										<p className="label">Temp</p>
									</div>
								</div>
							</CardBody>
						</Card>

						<Card className="col-span-2">
							<CardBody>
								<h3>Beans</h3>
								<p>Beans: {brew.beans?.name}</p>
								{selectedRoastDate && (
									<p>
										Roast Date:{" "}
										{new Date(
											selectedRoastDate
										).toLocaleDateString()}
									</p>
								)}
							</CardBody>
						</Card>

						<Card>
							<CardBody>
								<h3>Grinder</h3>
								<p>Grinder: {brew.grinder?.name}</p>
								<p>Grind Size: {brew.grind_size}</p>
							</CardBody>
						</Card>

						<Card>
							<CardBody>
								<h3>Brewer</h3>
								<p>Brewer: {brew.brewer?.name}</p>
							</CardBody>
						</Card>

						{/* 
						<p>
							Date:{" "}
							{new Date(brew.date).toLocaleDateString("sr-RS", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p> */}

						{brew.notes && (
							<Card className="col-span-2">
								<CardBody>
									<h2>Brew Notes</h2>
									<p>{brew.notes}</p>
								</CardBody>
							</Card>
						)}

						{brew.flow_chart_url && (
							<div>
								<h3>Flow Chart</h3>
								<img
									src={brew.flow_chart_url}
									alt="Flow chart"
									style={{ maxWidth: "300px" }}
								/>
							</div>
						)}

						<div className="col-span-2">
							<button
								onClick={() => setIsEditing(true)}
								style={{ marginRight: "0.5rem" }}
							>
								Edit
							</button>
							<button
								onClick={handleDelete}
								style={{
									marginRight: "0.5rem",
									backgroundColor: "#dc3545",
									color: "white",
									border: "none",
									padding: "8px 16px",
									borderRadius: "4px",
									cursor: "pointer",
								}}
							>
								Delete
							</button>
							<button
								onClick={handleAnalyze}
								disabled={isAnalyzing}
								style={{
									backgroundColor: "#4CAF50",
									color: "white",
									border: "none",
									padding: "8px 16px",
									borderRadius: "4px",
									cursor: isAnalyzing
										? "not-allowed"
										: "pointer",
									opacity: isAnalyzing ? 0.7 : 1,
								}}
							>
								{isAnalyzing
									? "Analyzing..."
									: "Run AI Analysis"}
							</button>
						</div>

						{brew.ai_suggestions && (
							<div className="col-span-2">
								<h3>AI Analysis</h3>
								<pre
									style={{
										whiteSpace: "pre-wrap",
										backgroundColor: "#f5f5f5",
										padding: "1rem",
										borderRadius: "4px",
										fontSize: "10px",
									}}
								>
									{brew.ai_suggestions}
								</pre>
							</div>
						)}
					</div>
				)}

				{isAnalyzing && (
					<div>
						<h3>AI Analysis in Progress</h3>
						<p>Analyzing your brew data... Please wait.</p>
					</div>
				)}
			</main>
		</>
	);
}

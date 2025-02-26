import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBrews, updateBrew, deleteBrew } from "../utils/supabase-queries";
import { analyzeBrewData } from "../utils/openai";
import Loader from "./Loader";
import { useQueryClient } from "@tanstack/react-query";

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

	useEffect(() => {
		loadBrew();
	}, [id]);

	const loadBrew = async () => {
		try {
			const brews = await getBrews();
			const brew = brews.find((b) => b.id === id);
			if (!brew) {
				setError("Brew not found");
				return;
			}
			setBrew(brew);
			setEditedBrew({
				...brew,
				coffee_id: brew.coffee?.id,
				grinder_id: brew.grinder?.id,
				brewer_id: brew.brewer?.id,
				roast_date_id: brew.roast_date_id,
				date: formatDateForInput(brew.date),
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
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

			// Get AI analysis
			const aiSuggestions = await analyzeBrewData(currentBrew);

			// Update the brew with new AI suggestions
			await updateBrew(id, {
				...currentBrew,
				ai_suggestions: aiSuggestions,
			});

			// Reload to get the latest data
			await loadBrew();
		} catch (err) {
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

	if (loading) return <Loader />;
	if (error) return <div>Error: {error}</div>;
	if (!brew) return <div>Brew not found</div>;

	// Find the selected roast date from coffee's roast dates
	const selectedRoastDate = brew.coffee?.roast_dates?.find(
		(rd) => rd.id === brew.roast_date_id
	);

	return (
		<div>
			{brew.image_url && (
				<div>
					<img
						src={brew.image_url}
						alt="Brew"
						style={{ maxWidth: "300px" }}
					/>
				</div>
			)}

			<button onClick={() => navigate("/brews")}>Back to Brews</button>
			<h2>Brew Details</h2>

			{isEditing ? (
				<div>
					<div>
						<label>
							Coffee:
							<select
								value={editedBrew.coffee_id}
								onChange={(e) =>
									setEditedBrew({
										...editedBrew,
										coffee_id: e.target.value,
									})
								}
								disabled // Disable changing coffee for now as it requires reloading roast dates
							>
								<option value={brew.coffee?.id}>
									{brew.coffee?.name}
								</option>
							</select>
						</label>
					</div>

					{brew.coffee?.roast_dates &&
						brew.coffee.roast_dates.length > 0 && (
							<div>
								<label>
									Roast Date:
									<select
										value={editedBrew.roast_date_id}
										onChange={(e) =>
											setEditedBrew({
												...editedBrew,
												roast_date_id: e.target.value,
											})
										}
									>
										{brew.coffee.roast_dates.map((rd) => (
											<option key={rd.id} value={rd.id}>
												{new Date(
													rd.date
												).toLocaleDateString()}
											</option>
										))}
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
					<button onClick={() => setIsEditing(false)}>Cancel</button>
				</div>
			) : (
				<div>
					<p>Date: {new Date(brew.date).toLocaleString()}</p>
					<p>Coffee: {brew.coffee?.name}</p>
					<p>
						Roast Date:{" "}
						{selectedRoastDate
							? new Date(
									selectedRoastDate.date
							  ).toLocaleDateString()
							: "Unknown"}
					</p>
					<p>Grinder: {brew.grinder?.name}</p>
					<p>Grind Size: {brew.grind_size}</p>
					<p>Brewer: {brew.brewer?.name}</p>
					<p>Brew Time: {brew.brew_time} seconds</p>
					<p>Dose: {brew.dose}g</p>
					<p>Yield: {brew.yield}g</p>
					{brew.notes && <p>Notes: {brew.notes}</p>}

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

					<div style={{ marginTop: "1rem" }}>
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
								cursor: isAnalyzing ? "not-allowed" : "pointer",
								opacity: isAnalyzing ? 0.7 : 1,
							}}
						>
							{isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
						</button>
					</div>

					{brew.ai_suggestions && (
						<div>
							<h3>AI Analysis</h3>
							<pre
								style={{
									whiteSpace: "pre-wrap",
									backgroundColor: "#f5f5f5",
									padding: "1rem",
									borderRadius: "4px",
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
		</div>
	);
}

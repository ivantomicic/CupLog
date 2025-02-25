import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBrewers, updateBrewer } from "../utils/supabase-queries";
import Loader from "./Loader";

export default function BrewerDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [brewer, setBrewer] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedBrewer, setEditedBrewer] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadBrewer();
	}, [id]);

	const loadBrewer = async () => {
		try {
			const brewers = await getBrewers();
			const brewer = brewers.find((b) => b.id === id);
			setBrewer(brewer);
			setEditedBrewer(brewer);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			const updatedBrewer = await updateBrewer(id, editedBrewer);
			setBrewer(updatedBrewer);
			setIsEditing(false);
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) return <Loader />;
	if (error) return <div>Error: {error}</div>;
	if (!brewer) return <div>Brewer not found</div>;

	return (
		<div>
			<button onClick={() => navigate("/brewers")}>
				Back to Brewers
			</button>
			<h2>Brewer Details</h2>

			{isEditing ? (
				<div>
					<div>
						<label>
							Name:
							<input
								type="text"
								value={editedBrewer.name}
								onChange={(e) =>
									setEditedBrewer({
										...editedBrewer,
										name: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Material:
							<input
								type="text"
								value={editedBrewer.material}
								onChange={(e) =>
									setEditedBrewer({
										...editedBrewer,
										material: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Type:
							<select
								value={editedBrewer.type}
								onChange={(e) =>
									setEditedBrewer({
										...editedBrewer,
										type: e.target.value,
									})
								}
							>
								<option>Pour Over</option>
								<option>Espresso</option>
								<option>Immersion</option>
							</select>
						</label>
					</div>
					<button onClick={handleSave}>Save</button>
					<button onClick={() => setIsEditing(false)}>Cancel</button>
				</div>
			) : (
				<div>
					<p>Name: {brewer.name}</p>
					<p>Material: {brewer.material}</p>
					<p>Type: {brewer.type}</p>
					<button onClick={() => setIsEditing(true)}>Edit</button>
				</div>
			)}
		</div>
	);
}

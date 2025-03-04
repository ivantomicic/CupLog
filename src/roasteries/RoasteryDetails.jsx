import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getRoasteries, updateRoastery } from "../utils/supabase";
import Loader from "../misc/Loader";
import { usePageHeader } from "../context/PageHeaderContext";

export default function RoasteryDetails() {
	const { id } = useParams();
	const [roastery, setRoastery] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedRoastery, setEditedRoastery] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const { updateHeader } = usePageHeader();

	useEffect(() => {
		loadRoastery();
	}, [id]);

	const loadRoastery = async () => {
		try {
			const roasteries = await getRoasteries();
			const roastery = roasteries.find((r) => r.id === id);
			setRoastery(roastery);
			setEditedRoastery(roastery);

			// Update the page header with the roastery name
			if (roastery?.name) {
				updateHeader({
					title: `${roastery.name} Roastery`,
				});
			} else {
				updateHeader({ title: "Roastery Details" });
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			await updateRoastery(id, {
				name: editedRoastery.name,
				// Add other fields as necessary
			});
			await loadRoastery(); // Reload to get updated data
			setIsEditing(false);

			// Update header to remove "Editing" prefix
			if (editedRoastery.name) {
				updateHeader({ title: `${editedRoastery.name} Roastery` });
			}
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) return <Loader />;
	if (error) return <div>Error: {error}</div>;
	if (!roastery) return <div>Roastery not found</div>;

	return (
		<main className="main-content">
			{isEditing ? (
				<div>
					<div>
						<label>
							Name:
							<input
								type="text"
								value={editedRoastery.name}
								onChange={(e) =>
									setEditedRoastery({
										...editedRoastery,
										name: e.target.value,
									})
								}
							/>
						</label>
					</div>
					{/* Add more fields for editing as necessary */}
					<button onClick={handleSave}>Save</button>
					<button onClick={() => setIsEditing(false)}>Cancel</button>
				</div>
			) : (
				<div>
					<p>Name: {roastery.name}</p>
					{/* Display more roastery details as necessary */}
					<button onClick={() => setIsEditing(true)}>Edit</button>
				</div>
			)}
		</main>
	);
}

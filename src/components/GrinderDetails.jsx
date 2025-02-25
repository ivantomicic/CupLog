import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGrinders, updateGrinder } from "../utils/supabase-queries";
import Loader from "./Loader";

export default function GrinderDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [grinder, setGrinder] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedGrinder, setEditedGrinder] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadGrinder();
	}, [id]);

	const loadGrinder = async () => {
		try {
			const grinders = await getGrinders();
			const grinder = grinders.find((g) => g.id === id);
			setGrinder(grinder);
			setEditedGrinder(grinder);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		try {
			const updatedGrinder = await updateGrinder(id, {
				name: editedGrinder.name,
				burr_size: editedGrinder.burrSize,
				burr_type: editedGrinder.burrType,
				ideal_for: editedGrinder.idealFor,
			});
			setGrinder(updatedGrinder);
			setIsEditing(false);
		} catch (err) {
			setError(err.message);
		}
	};

	if (loading) return <Loader />;
	if (error) return <div>Error: {error}</div>;
	if (!grinder) return <div>Grinder not found</div>;

	return (
		<div>
			<button onClick={() => navigate("/grinders")}>
				Back to Grinders
			</button>
			<h2>Grinder Details</h2>

			{isEditing ? (
				<div>
					<div>
						<label>
							Name:
							<input
								type="text"
								value={editedGrinder.name}
								onChange={(e) =>
									setEditedGrinder({
										...editedGrinder,
										name: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Burr Size:
							<input
								type="text"
								value={editedGrinder.burr_size}
								onChange={(e) =>
									setEditedGrinder({
										...editedGrinder,
										burr_size: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Burr Type:
							<input
								type="text"
								value={editedGrinder.burr_type}
								onChange={(e) =>
									setEditedGrinder({
										...editedGrinder,
										burr_type: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<div>
						<label>
							Ideal For:
							<input
								type="text"
								value={editedGrinder.ideal_for}
								onChange={(e) =>
									setEditedGrinder({
										...editedGrinder,
										ideal_for: e.target.value,
									})
								}
							/>
						</label>
					</div>
					<button onClick={handleSave}>Save</button>
					<button onClick={() => setIsEditing(false)}>Cancel</button>
				</div>
			) : (
				<div>
					<p>Name: {grinder.name}</p>
					<p>Burr Size: {grinder.burr_size}</p>
					<p>Burr Type: {grinder.burr_type}</p>
					<p>Ideal For: {grinder.ideal_for}</p>
					<button onClick={() => setIsEditing(true)}>Edit</button>
				</div>
			)}
		</div>
	);
}

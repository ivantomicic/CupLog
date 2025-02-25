import { Link } from "react-router-dom";

function CoffeeCard({ brew, onDelete, isDeleting }) {
	const handleDelete = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this brew log?"
		);
		if (confirmDelete) {
			await onDelete(brew.id);
		}
	};

	return (
		<li className="coffee-card">
			<Link to={`/brews/${brew.id}`} className="coffee-card-content">
				<div className="coffee-card-header">
					<span className="coffee-name">{brew.coffee?.name}</span>
					<span className="brew-date">
						{new Date(brew.date).toLocaleString()}
					</span>
				</div>

				<div className="brew-stats">
					<span>{brew.dose}g in</span>
					<span>{brew.yield}g out</span>
					<span>{brew.brew_time}s</span>
				</div>

				{brew.notes && (
					<p className="brew-notes">Notes: {brew.notes}</p>
				)}

				{brew.image_url && (
					<img
						src={brew.image_url}
						alt="Brew"
						className="brew-image"
					/>
				)}
			</Link>

			<button
				onClick={handleDelete}
				disabled={isDeleting}
				className="delete-button"
			>
				{isDeleting ? "Deleting..." : "Delete"}
			</button>
		</li>
	);
}

export default CoffeeCard;

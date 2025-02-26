import { Link } from "react-router-dom";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoScaleOutline } from "react-icons/io5";
import { BsCup } from "react-icons/bs";
import { TbTimeDurationOff } from "react-icons/tb";
import { motion } from "framer-motion";

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
		<motion.div
			whileTap={{ scale: 0.97 }}
			// initial={{ opacity: 0, y: 20 }}
			// animate={{ opacity: 1, y: 0 }}
			// exit={{ opacity: 0, y: -20 }}
			transition={{
				type: "spring",
				stiffness: 500,
				damping: 30,
			}}
		>
			<Link to={`/brews/${brew.id}`} className="coffee-card">
				<div className="coffee-card-image">
					{brew.image_url ? (
						<img src={brew.image_url} alt="Brew" />
					) : (
						<img src="/placeholder.png" alt="Brew" />
					)}

					<div className="information">
						{new Date(brew.date).toLocaleDateString("en-US", {
							weekday: "long",
							day: "2-digit",
							month: "long",
							year: "numeric",
						})}{" "}
						-{" "}
						{new Date(brew.date).toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						})}
						h
					</div>
				</div>

				<div className="coffee-card-content">
					<img
						src="/boo.png"
						alt=""
						className="coffee-card-roastery"
					/>

					<h2 className="coffee-card-name">{brew.coffee?.name}</h2>

					<div className="coffee-card-flex-info">
						<p className="coffee-card-brew-type">Espresso</p>

						<p className="coffee-card-brew-info">
							<IoScaleOutline />
							{brew.dose}s
						</p>

						<p className="coffee-card-brew-info">
							<MdOutlineAccessTime />
							{brew.brew_time}s
						</p>

						<p className="coffee-card-brew-info">
							<BsCup />
							{brew.yield}g
						</p>

						<p className="coffee-card-brew-info">
							<TbTimeDurationOff />
							1:{(brew.yield / brew.dose).toFixed(2)}
						</p>
					</div>

					{brew.notes && (
						<p className="coffee-card-brew-notes">
							Notes: {brew.notes}
						</p>
					)}
				</div>
			</Link>
		</motion.div>
	);
}

export default CoffeeCard;

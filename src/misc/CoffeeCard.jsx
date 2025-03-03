import { Link } from "react-router-dom";
import { MdOutlineAccessTime } from "react-icons/md";
import { IoScaleOutline } from "react-icons/io5";
import { BsCup } from "react-icons/bs";
import { TbTimeDurationOff } from "react-icons/tb";
import { motion } from "framer-motion";

function CoffeeCard({ brew }) {
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
						{new Date(brew.date).toLocaleDateString("sr-RS", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>

				<div className="coffee-card-content">
					<img
						src="/boo.png"
						alt=""
						className="coffee-card-roastery"
					/>

					<h2 className="coffee-card-name">{brew.beans?.name}</h2>

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

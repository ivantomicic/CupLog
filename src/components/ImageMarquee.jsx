import { useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";

const ImageMarquee = ({ images, columns = 3, className = "" }) => {
	// Generate column configurations
	const columnConfigs = useMemo(() => {
		const imagesPerColumn = Math.ceil(images.length / columns);

		return Array(columns)
			.fill(null)
			.map((_, index) => {
				const startIndex = index * imagesPerColumn;
				const columnImages = images.slice(
					startIndex,
					startIndex + imagesPerColumn
				);

				// If we don't have enough images to fill the column, take from the start
				if (columnImages.length < imagesPerColumn) {
					const remaining = imagesPerColumn - columnImages.length;
					columnImages.push(...images.slice(0, remaining));
				}

				return {
					direction: index % 2 === 0 ? "up" : "down", // Alternate directions
					speed: 0.005 + Math.random() * 0.01, // Reduced speed: random between 0.005 and 0.015
					images: columnImages,
				};
			});
	}, [images, columns]);

	return (
		<div className={`image-marquee-container ${className}`}>
			{columnConfigs.map((config, columnIndex) => (
				<MarqueeColumn
					key={columnIndex}
					images={config.images}
					direction={config.direction}
					speed={config.speed}
				/>
			))}
		</div>
	);
};

const MarqueeColumn = ({ images, direction, speed }) => {
	const columnRef = useRef(null);

	useEffect(() => {
		const column = columnRef.current;
		let position = direction === "up" ? 0 : -25;

		function animate() {
			if (direction === "up") {
				position -= speed;
				if (position <= -50) position = 0;
			} else {
				position += speed;
				if (position >= 0) position = -50;
			}

			column.style.transform = `translateY(${position}%)`;
			requestAnimationFrame(animate);
		}

		const animation = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animation);
	}, [direction, speed]);

	// Duplicate images for seamless loop
	const allImages = [...images, ...images];

	return (
		<div className="marquee-column">
			<div className="marquee-column-inner" ref={columnRef}>
				{allImages.map((image, index) => (
					<img
						key={`${image}-${index}`}
						src={image}
						alt={`Marquee image ${index + 1}`}
						className="marquee-image"
					/>
				))}
			</div>
		</div>
	);
};

MarqueeColumn.propTypes = {
	images: PropTypes.arrayOf(PropTypes.string).isRequired,
	direction: PropTypes.oneOf(["up", "down"]).isRequired,
	speed: PropTypes.number.isRequired,
};

ImageMarquee.propTypes = {
	images: PropTypes.arrayOf(PropTypes.string).isRequired,
	columns: PropTypes.number,
	className: PropTypes.string,
};

export default ImageMarquee;

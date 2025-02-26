import { FiPlusCircle } from "react-icons/fi";

export default function PageHeader({ title }) {
	return (
		<div className="page-header">
			<h2 className="page-header-title">{title}</h2>

			<button className="page-header-button">
				<FiPlusCircle />
			</button>
		</div>
	);
}

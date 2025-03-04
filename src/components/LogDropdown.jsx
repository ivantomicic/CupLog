import { useState } from "react";
import PropTypes from "prop-types";
import {
	Button,
	Dropdown,
	DropdownSection,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import Drawer from "./Drawer";

function LogDropdown({ buttonLabel, items }) {
	const [openDrawerKey, setOpenDrawerKey] = useState(null);

	const handleDrawerClose = () => {
		setOpenDrawerKey(null);
	};

	return (
		<>
			<Dropdown className="shadow-m" placement="bottom">
				<DropdownTrigger>
					<Button color="primary">{buttonLabel}</Button>
				</DropdownTrigger>
				<DropdownMenu
					closeOnSelect
					aria-label="Actions"
					color="default"
					variant="flat"
				>
					<DropdownSection>
						{items.map((item) => (
							<DropdownItem
								key={item.key}
								description={item.description}
								startContent={item.icon}
								onClick={() => setOpenDrawerKey(item.key)}
							>
								{item.title}
							</DropdownItem>
						))}
					</DropdownSection>
				</DropdownMenu>
			</Dropdown>

			{items.map((item) => (
				<Drawer
					key={item.key}
					isOpen={openDrawerKey === item.key}
					onClose={handleDrawerClose}
					title={item.title}
				>
					{item.component}
				</Drawer>
			))}
		</>
	);
}

LogDropdown.propTypes = {
	buttonLabel: PropTypes.string.isRequired,
	items: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			icon: PropTypes.node.isRequired,
			component: PropTypes.node.isRequired,
		})
	).isRequired,
};

export default LogDropdown;

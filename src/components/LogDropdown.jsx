import { useState } from "react";
import {
	Button,
	Dropdown,
	DropdownSection,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import Drawer from "./Drawer";
import NewBeans from "../beans/NewBeans";

import { AddNoteBulkIcon, CopyDocumentBulkIcon } from "@heroui/shared-icons";

const iconClasses =
	"text-2xl text-default-500 pointer-events-none flex-shrink-0";

function LogDropdown() {
	const [isBeansDrawerOpen, setIsBeansDrawerOpen] = useState(false);
	const [isRoasteryDrawerOpen, setIsRoasteryDrawerOpen] = useState(false);

	const handleDrawerClose = () => {
		setIsBeansDrawerOpen(false);
		setIsRoasteryDrawerOpen(false);
	};

	return (
		<>
			<Dropdown className="shadow-m" placement="bottom">
				<DropdownTrigger>
					<Button color="primary">Add</Button>
				</DropdownTrigger>
				<DropdownMenu
					closeOnSelect
					aria-label="Actions"
					color="default"
					variant="flat"
				>
					<DropdownSection>
						<DropdownItem
							key="newBeans"
							description="Add new bag of beans"
							startContent={
								<AddNoteBulkIcon className={iconClasses} />
							}
							onClick={() => setIsBeansDrawerOpen(true)}
						>
							New Beans
						</DropdownItem>
						<DropdownItem
							key="newRoastery"
							description="Add new roastery"
							startContent={
								<CopyDocumentBulkIcon className={iconClasses} />
							}
							onClick={() => setIsRoasteryDrawerOpen(true)}
						>
							New Roastery
						</DropdownItem>
					</DropdownSection>
				</DropdownMenu>
			</Dropdown>

			<Drawer
				isOpen={isBeansDrawerOpen}
				onClose={handleDrawerClose}
				title="Log New Beans"
			>
				<NewBeans />
			</Drawer>

			<Drawer
				isOpen={isRoasteryDrawerOpen}
				onClose={handleDrawerClose}
				title="Log New Roastery"
			>
				roastery
			</Drawer>
		</>
	);
}
export default LogDropdown;

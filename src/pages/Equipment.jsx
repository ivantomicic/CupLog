import { Tabs, Tab } from "@heroui/react";
import Brewers from "../brewers/Brewers";
import { PiCoffeeBeanFill } from "react-icons/pi";
import LogDropdown from "../components/LogDropdown";
import Grinders from "../grinders/Grinders";
import NewGrinder from "../grinders/NewGrinder";
import NewBrewer from "../brewers/NewBrewer";

import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

const dropdownItems = [
	{
		key: "newGrinder",
		title: "New Grinder",
		description: "Add new grinder",
		icon: <PiCoffeeBeanFill />,
		component: <NewGrinder />,
	},
	{
		key: "newBrewer",
		title: "New Brewer",
		description: "Add new brewer",
		icon: <PiCoffeeBeanFill />,
		component: <NewBrewer />,
	},
];

export default function Equipment() {
	// Update the page header
	useUpdatePageHeader({
		title: "Equipment",
		actionComponent: (
			<LogDropdown
				buttonLabel="Log New Equipment"
				items={dropdownItems}
			/>
		),
	});

	return (
		<>
			<main className="main-content">
				<div className="flex w-full flex-col">
					<Tabs
						aria-label="Options"
						classNames={{
							base: "mb-8",
							tabList: "w-full ",
							tab: "w-full",
						}}
					>
						<Tab key="brewers" title="Brewers">
							<Brewers />
						</Tab>
						<Tab key="grinders" title="Grinders">
							<Grinders />
						</Tab>
					</Tabs>
				</div>
			</main>
		</>
	);
}

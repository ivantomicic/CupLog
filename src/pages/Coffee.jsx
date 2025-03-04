import { Tabs, Tab } from "@heroui/react";
import Beans from "../beans/Beans";
import Roasteries from "../roasteries/Roasteries";
import { PiCoffeeBeanFill } from "react-icons/pi";
import LogDropdown from "../components/LogDropdown";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";
import NewBeans from "../beans/NewBeans";
import NewRoastery from "../roasteries/NewRoastery";

const dropdownItems = [
	{
		key: "newBeans",
		title: "New Beans",
		description: "Add new bag of beans",
		icon: <PiCoffeeBeanFill />,
		component: <NewBeans />,
	},
	{
		key: "newRoastery",
		title: "New Roastery",
		description: "Add new roastery",
		icon: <PiCoffeeBeanFill />,
		component: <NewRoastery />,
	},
];

export default function Coffee() {
	// Update the page header
	useUpdatePageHeader({
		title: "Beans & Roasteries",
		actionComponent: (
			<LogDropdown
				buttonLabel="Log New Beans or Roastery"
				items={dropdownItems}
			/>
		),
	});

	return (
		<main className="main-content">
			<div className="flex w-full flex-col">
				<Tabs
					aria-label="Options"
					classNames={{
						base: "mb-4",
						tabList: "w-full",
						tab: "w-full",
					}}
				>
					<Tab key="beans" title="Beans">
						<Beans />
					</Tab>
					<Tab key="roasteries" title="Roasteries">
						<Roasteries />
					</Tab>
				</Tabs>
			</div>
		</main>
	);
}

import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import Beans from "../beans/Beans";
import Roasteries from "../roasteries/Roasteries";
import LogDropdown from "../components/LogDropdown";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

export default function Coffee() {
	// Update the page header
	useUpdatePageHeader({
		title: "Beans & Roasteries",
		actionComponent: LogDropdown,
	});

	return (
		<>
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
		</>
	);
}

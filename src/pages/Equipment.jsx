import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import Brewers from "../brewers/Brewers";
import Grinders from "../grinders/Grinders";

import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

export default function Equipment() {
	// Update the page header
	useUpdatePageHeader({
		title: "Equipment",
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

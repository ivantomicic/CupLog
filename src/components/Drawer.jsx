// import { Drawer } from "vaul";

import {
	Drawer as DrawerComponent,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
} from "@heroui/drawer";

function Drawer({ isOpen, onClose, title, children }) {
	return (
		<DrawerComponent
			isOpen={isOpen}
			onOpenChange={onClose}
			placement="bottom"
			size="auto"
			classNames={{
				body: "mb-4 pb-[var(--safe-area-inset-bottom)]",
			}}
		>
			<DrawerContent>
				{(onClose) => (
					<>
						<DrawerHeader className="flex flex-col gap-1">
							{title}
						</DrawerHeader>
						<DrawerBody>{children}</DrawerBody>
					</>
				)}
			</DrawerContent>
		</DrawerComponent>
	);
}

export default Drawer;

// import { Drawer } from "vaul";

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
} from "@heroui/drawer";

function CustomDrawer({ isOpen, onClose, title, children }) {
	return (
		<Drawer
			isOpen={isOpen}
			onOpenChange={onClose}
			placement="bottom"
			size="auto"
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
		</Drawer>
	);
}

export default CustomDrawer;

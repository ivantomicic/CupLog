import { Drawer as DrawerComponent } from "vaul";

function Drawer({ isOpen, onClose, title, children }) {
	return (
		<DrawerComponent.Root open={isOpen} onOpenChange={onClose}>
			<DrawerComponent.Portal>
				<DrawerComponent.Overlay className="fixed inset-0 bg-black/40" />
				<DrawerComponent.Content className="bg-white h-fit fixed bottom-0 left-0 right-0 outline-none">
					<div className="p-4 bg-white rounded-t-md flex-1 overflow-y-auto">
						<div className="max-w-md mx-auto space-y-4">
							<div
								aria-hidden
								className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4"
							/>
							<DrawerComponent.Title className="font-medium mb-4 text-gray-900">
								{title}
							</DrawerComponent.Title>
							{children}
						</div>
					</div>
				</DrawerComponent.Content>
			</DrawerComponent.Portal>
		</DrawerComponent.Root>
		// <DrawerComponent
		// 	isOpen={isOpen}
		// 	onOpenChange={onClose}
		// 	placement="bottom"
		// 	size="auto"
		// 	classNames={{
		// 		body: "mb-4 pb-[var(--safe-area-inset-bottom)]",
		// 	}}
		// >
		// 	<DrawerContent>
		// 		{(onClose) => (
		// 			<>
		// 				<DrawerHeader className="flex flex-col gap-1">
		// 					{title}
		// 				</DrawerHeader>
		// 				<DrawerBody>{children}</DrawerBody>
		// 			</>
		// 		)}
		// 	</DrawerContent>
		// </DrawerComponent>
	);
}

export default Drawer;

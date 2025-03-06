import { Drawer as DrawerComponent } from "vaul";

export const Drawer = ({ isOpen, onClose, title, children }) => {
	return (
		<DrawerComponent.Root open={isOpen} onOpenChange={onClose}>
			<DrawerComponent.Portal>
				<DrawerComponent.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" />
				<DrawerComponent.Content className="bg-gray-100 flex flex-col rounded-t-[24px] mt-24 h-fit fixed bottom-0 left-2 right-2 outline-none max-w-xl ml-auto mr-auto">
					<div className="p-4 bg-white rounded-t-[24px] flex-1">
						<div className="max-w-md mx-auto space-y-4 pb-2">
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
	);
};

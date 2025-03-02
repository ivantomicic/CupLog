import { Drawer } from "vaul";

function CustomDrawer({ isOpen, onClose, title, children }) {
	return (
		<Drawer.Root open={isOpen} onOpenChange={onClose}>
			{/* <Drawer.Trigger>Open Drawer</Drawer.Trigger> */}
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 bg-black/40" />
				<Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] mt-24 h-fit fixed bottom-0 left-2 right-2 outline-none">
					<div className="p-4 bg-white rounded-t-[10px] flex-1">
						<div
							aria-hidden
							className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-2"
						/>
						<div className="max-w-md mx-auto">
							<Drawer.Title className="font-medium mb-4 text-gray-900">
								{title}
							</Drawer.Title>
							{children}
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}

export default CustomDrawer;

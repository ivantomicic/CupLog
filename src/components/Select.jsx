import {
	Select as SelectComponent,
	SelectItem as SelectItemComponent,
} from "@heroui/react";

export const Select = ({ options, value, onChange, label }) => {
	return (
		<SelectComponent
			label={label}
			defaultSelectedKeys={[value]}
			items={options}
			size="sm"
			onChange={onChange}
			popoverProps={{
				classNames: {
					content: "pointer-events-auto",
				},
			}}
		>
			{(item) => <SelectItemComponent>{item.label}</SelectItemComponent>}
		</SelectComponent>
	);
};

import {
	Select as SelectComponent,
	SelectItem as SelectItemComponent,
} from "@heroui/react";

function Select({ options, value, onChange, label }) {
	return (
		<SelectComponent
			label={label}
			defaultSelectedKeys={[value]}
			items={options}
			onChange={onChange}
		>
			{(item) => <SelectItemComponent>{item.label}</SelectItemComponent>}
		</SelectComponent>
	);
}
export default Select;

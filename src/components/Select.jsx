import {
	Select as SelectComponent,
	SelectItem as SelectItemComponent,
} from "@heroui/react";

function Select({ options, value, onChange, label }) {
	return (
		<div className="form-field">
			<SelectComponent
				label={label}
				value={value}
				items={options}
				onChange={onChange}
			>
				{(item) => (
					<SelectItemComponent>{item.label}</SelectItemComponent>
				)}
			</SelectComponent>
		</div>
	);
}
export default Select;

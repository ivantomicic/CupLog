import { Input as InputComponent } from "@heroui/react";

export const endContent = (value) => {
	return (
		<div className="pointer-events-none flex items-center">
			<span className="text-default-400 text-small">{value}</span>
		</div>
	);
};

function Input({
	value,
	onChange,
	label,
	placeholder,
	type = "text",
	isDisabled = false,
	suffix,
	...props
}) {
	return (
		<div className="form-field">
			<InputComponent
				label={label}
				placeholder={placeholder}
				type={type}
				value={value}
				onChange={onChange}
				disabled={isDisabled}
				{...(suffix && { endContent: endContent(suffix) })}
				{...props}
			/>
		</div>
	);
}
export default Input;

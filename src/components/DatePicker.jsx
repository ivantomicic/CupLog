import { DatePicker as DatePickerComponent } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate, now, getLocalTimeZone } from "@internationalized/date";

// const date = new Date(isoDate);

const convertDateObjectToISOTimestamp = (dateObject) => {
	if (!dateObject) return null;

	// Create a JavaScript Date object from the date components
	const jsDate = new Date(
		dateObject.year,
		dateObject.month - 1,
		dateObject.day
	);

	// Return the full ISO timestamp
	return jsDate.toISOString();
};

function DatePicker({ value, onChange, label }) {
	return (
		<div className="form-field">
			<I18nProvider locale="en-GB">
				<DatePickerComponent
					label={label}
					onChange={(x) => {
						const isoDate = convertDateObjectToISOTimestamp(x);
						console.log(isoDate);
						// Pass the ISO date string to the parent component
						onChange(isoDate);
					}}
				/>
			</I18nProvider>
		</div>
	);
}
export default DatePicker;

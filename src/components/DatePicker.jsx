import { DatePicker as DatePickerComponent } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate, now, getLocalTimeZone } from "@internationalized/date";

// const date = new Date(isoDate);

const convertDateObjectToISOTimestamp = (
	dateObject,
	allowTimePicker = false
) => {
	if (!dateObject) return null;

	if (allowTimePicker) {
		// Create date in local timezone
		const date = new Date(
			dateObject.year,
			dateObject.month - 1,
			dateObject.day,
			dateObject.hour || 0,
			dateObject.minute || 0,
			dateObject.second || 0
		);

		const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
		const localISOTime = new Date(date.getTime() - tzOffset).toISOString();

		return localISOTime;
	} else {
		return `${dateObject.year}-${String(dateObject.month).padStart(
			2,
			"0"
		)}-${String(dateObject.day).padStart(2, "0")}`;
	}
};

function DatePicker({
	value,
	onChange,
	label,
	allowTimePicker = false,
	...props
}) {
	return (
		<I18nProvider locale="en-GB">
			<DatePickerComponent
				label={label}
				onChange={(x) => {
					const isoDate = convertDateObjectToISOTimestamp(
						x,
						allowTimePicker
					);
					console.log(isoDate);
					onChange(isoDate);
				}}
				granularity={allowTimePicker ? "minute" : "day"}
				value={value ? parseDate(value) : undefined}
				defaultValue={!value ? now(getLocalTimeZone()) : undefined}
				{...props}
			/>
		</I18nProvider>
	);
}
export default DatePicker;

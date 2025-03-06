import { DatePicker as DatePickerComponent } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate, now, getLocalTimeZone } from "@internationalized/date";
import PropTypes from "prop-types";

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

export const DatePicker = ({
	value,
	onChange,
	label,
	allowTimePicker = false,
	...props
}) => {
	return (
		<I18nProvider locale="en-GB">
			<DatePickerComponent
				label={label}
				size="sm"
				onChange={(x) => {
					const isoDate = convertDateObjectToISOTimestamp(
						x,
						allowTimePicker
					);
					console.log(isoDate);
					onChange(isoDate);
				}}
				popoverProps={{
					classNames: {
						content: "pointer-events-auto",
					},
				}}
				granularity={allowTimePicker ? "minute" : "day"}
				value={value ? parseDate(value) : undefined}
				defaultValue={!value ? now(getLocalTimeZone()) : undefined}
				{...props}
			/>
		</I18nProvider>
	);
};

DatePicker.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
	allowTimePicker: PropTypes.bool,
};

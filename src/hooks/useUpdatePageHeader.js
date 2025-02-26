import { useEffect } from "react";
import { usePageHeader } from "../context/PageHeaderContext";

/**
 * Custom hook to update the page header
 * @param {string} title - The title to display in the header
 * @param {string|null} buttonTarget - The target URL for the button, or null to hide the button
 */
export default function useUpdatePageHeader(title, buttonTarget = null) {
	const { updateHeader } = usePageHeader();

	useEffect(() => {
		updateHeader({ title, buttonTarget });
	}, [title, buttonTarget, updateHeader]);
}

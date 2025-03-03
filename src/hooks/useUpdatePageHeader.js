import { useEffect } from "react";
import { usePageHeader } from "../context/PageHeaderContext";

export default function useUpdatePageHeader({
	title,
	buttonTarget = null,
	buttonComponent = null,
	buttonComponentTitle = null,
	buttonIcon = null,
	actionComponent = null,
}) {
	const { updateHeader } = usePageHeader();

	useEffect(() => {
		updateHeader({
			title,
			buttonTarget,
			buttonComponent,
			buttonComponentTitle,
			buttonIcon,
			actionComponent,
		});
	}, [
		title,
		buttonTarget,
		buttonComponent,
		buttonComponentTitle,
		buttonIcon,
		updateHeader,
		actionComponent,
	]);
}

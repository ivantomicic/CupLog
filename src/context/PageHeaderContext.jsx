import { createContext, useState, useContext, useCallback } from "react";
import PropTypes from "prop-types";

const PageHeaderContext = createContext();

export function PageHeaderProvider({ children }) {
	const [headerState, setHeaderState] = useState({
		title: "",
		buttonTarget: null,
		buttonComponent: null,
		buttonIcon: null,
		actionComponent: null,
	});

	const updateHeader = useCallback((newState) => {
		setHeaderState((prevState) => {
			// Check if the new state is actually different from the previous state
			const hasChanges = Object.keys(newState).some(
				(key) => prevState[key] !== newState[key]
			);

			// Only update if there are changes
			return hasChanges ? { ...prevState, ...newState } : prevState;
		});
	}, []);

	return (
		<PageHeaderContext.Provider value={{ headerState, updateHeader }}>
			{children}
		</PageHeaderContext.Provider>
	);
}

PageHeaderProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export function usePageHeader() {
	const context = useContext(PageHeaderContext);
	if (!context) {
		throw new Error(
			"usePageHeader must be used within a PageHeaderProvider"
		);
	}
	return context;
}

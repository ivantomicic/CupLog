import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const PageHeaderContext = createContext();

export function PageHeaderProvider({ children }) {
	const [headerState, setHeaderState] = useState({
		title: "",
		buttonTarget: null,
	});

	const updateHeader = (newState) => {
		setHeaderState((prevState) => ({
			...prevState,
			...newState,
		}));
	};

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

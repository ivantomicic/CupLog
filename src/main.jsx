import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/react";
import App from "./App.jsx";
import "./main.css";
import "./styles/index.scss";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30000, // Data is considered fresh for 30 seconds
			cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
			refetchOnWindowFocus: false, // Don't refetch when window regains focus
		},
	},
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<HeroUIProvider>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</HeroUIProvider>
	</StrictMode>
);

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../misc/Loader";
import { getBeans, createBean, getRoasteries } from "../utils/supabase";
import { Button, DatePicker, Input, Select } from "@cuplog/components";

export default function NewBeans() {
	const queryClient = useQueryClient();
	const [newBeans, setNewBeans] = useState({
		name: "",
		country: "",
		region: "",
		farm: "",
		altitude: "",
		roast_type: "espresso",
		roastery: "",
	});
	const [newRoastDate, setNewRoastDate] = useState("");

	// Query for fetching beans with caching
	const {
		data: beans = [],
		error,
		isInitialLoading,
	} = useQuery({
		queryKey: ["beans"],
		queryFn: getBeans,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	const { data: roasteries = [], error: roasteriesError } = useQuery({
		queryKey: ["roasteries"],
		queryFn: getRoasteries,
		staleTime: 30000,
		cacheTime: 5 * 60 * 1000,
	});

	// Mutation for creating bean
	const createMutation = useMutation({
		mutationFn: async (beanData) => {
			const beans = await createBean({
				...beanData,
				roastDate: newRoastDate || null,
			});
			return beans;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["beans"]);
			// Reset form after successful creation
			setNewBeans({
				name: "",
				country: "",
				region: "",
				farm: "",
				altitude: "",
				roastType: "",
			});
			setNewRoastDate("");
		},
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		// If roastDate is already in ISO format from DatePicker, use it directly
		const newBean = {
			name: newBeans.name,
			country: newBeans.country,
			region: newBeans.region,
			farm: newBeans.farm,
			altitude: newBeans.altitude,
			roastType: newBeans.roastType,
			roastery: newBeans.roastery,
			roast_dates: newRoastDate ? [newRoastDate] : [],
		};

		await createMutation.mutateAsync(newBean);
	};

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
			<Input
				label="Name"
				value={newBeans.name}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						name: e.target.value,
					});
				}}
				required
				disabled={createMutation.isPending}
			/>

			<Input
				label="Country"
				value={newBeans.country}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						country: e.target.value,
					});
				}}
				required
				disabled={createMutation.isPending}
			/>

			<Input
				label="Region"
				value={newBeans.region}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						region: e.target.value,
					});
				}}
				required
				disabled={createMutation.isPending}
			/>

			<Input
				label="Farm"
				value={newBeans.farm}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						farm: e.target.value,
					});
				}}
				required
				disabled={createMutation.isPending}
			/>

			<Input
				label="Altitude"
				value={newBeans.altitude}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						altitude: e.target.value,
					});
				}}
				suffix="meters"
				required
				disabled={createMutation.isPending}
			/>

			<Select
				label="Roast Type"
				value={newBeans.roastType}
				options={[
					{
						key: "Espresso",
						label: "Espresso",
					},
					{
						key: "Filter",
						label: "Filter",
					},
					{
						key: "Omni",
						label: "Omni",
					},
				]}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						roastType: e.target.value,
					});
				}}
				required
				disabled={createMutation.isPending}
			/>

			<Select
				label="Roastery"
				value={newBeans.roastery}
				options={roasteries.map((roastery) => ({
					key: roastery.id,
					label: roastery.name,
				}))}
				onChange={(e) => {
					setNewBeans({
						...newBeans,
						roastery: e.target.value,
					});
				}}
				required
				disabled={createMutation.isPending}
			/>

			<DatePicker
				label="Initial Roast Date"
				onChange={(x) => {
					console.log(x);
					setNewRoastDate(x);
				}}
			/>

			<Button
				type="submit"
				disabled={createMutation.isPending}
				className="col-span-2"
				color="primary"
			>
				{createMutation.isPending ? "Adding..." : "Add Bean"}
			</Button>
		</form>
	);
}

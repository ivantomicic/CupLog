import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../misc/Loader";
import {
	getBeans,
	createBean,
	deleteBean,
	getRoasteries,
} from "../utils/supabase";
import Select from "../components/Select";
import Input from "../components/Input";
import DatePicker from "../components/DatePicker";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";

// Helper function to get the closest roast date to today
const getClosestRoastDate = (roastDates) => {
	if (!roastDates || roastDates.length === 0) return null;
	const today = new Date();
	return roastDates.reduce((closest, current) => {
		const closestDate = new Date(closest);
		const currentDate = new Date(current);
		const closestDiff = Math.abs(today - closestDate);
		const currentDiff = Math.abs(today - currentDate);
		return currentDiff < closestDiff ? current : closest;
	});
};

export default function Beans() {
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

	// Update the page header
	useUpdatePageHeader("Beans");

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

	// Mutation for deleting bean
	const deleteMutation = useMutation({
		mutationFn: deleteBean,
		onSuccess: (_, beansId) => {
			queryClient.setQueryData(["beans"], (old) =>
				old?.filter((beans) => beans.id !== beansId)
			);
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

	const handleDelete = async (e, beansId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this bean? This will affect any brew logs using this bean."
		);
		if (confirmDelete) {
			try {
				await deleteMutation.mutateAsync(beansId);
			} catch (err) {
				console.error("Failed to delete bean:", err);
			}
		}
	};

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<>
			<form onSubmit={handleSubmit}>
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

				<div className="form-field full-width">
					<button type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending ? "Adding..." : "Add Bean"}
					</button>
				</div>
			</form>

			<hr style={{ margin: "20px 0" }} />

			<div className="grid grid-cols-3 gap-6">
				{beans.map((bean) => {
					const closestRoastDate = getClosestRoastDate(
						bean.roast_dates
					);
					return (
						<Card key={bean.id}>
							<Link
								to={`/beans/${bean.id}`}
								className="bean-details"
							>
								<CardBody>
									<h3>{bean.name}</h3>
									<p>
										{bean.country}, {bean.region}
									</p>
									<p className="roast-type">
										{bean.roast} roast
									</p>
									{closestRoastDate && (
										<p className="roast-date">
											Latest roast:{" "}
											{new Date(
												closestRoastDate
											).toLocaleDateString()}
										</p>
									)}
								</CardBody>
								<CardFooter>
									<button
										onClick={(e) =>
											handleDelete(e, bean.id)
										}
										disabled={deleteMutation.isPending}
										className="delete-button"
									>
										{deleteMutation.isPending
											? "Deleting..."
											: "Delete"}
									</button>
								</CardFooter>
							</Link>
						</Card>
					);
				})}
			</div>
		</>
	);
}

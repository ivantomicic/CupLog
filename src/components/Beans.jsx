import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "./Loader";
import PropTypes from "prop-types";
import {
	getBeans,
	createBean,
	deleteBean,
	createRoastDate,
} from "../utils/supabase";
import useUpdatePageHeader from "../hooks/useUpdatePageHeader";

// Helper function to get the closest roast date to today
const getClosestRoastDate = (roastDates) => {
	if (!roastDates || roastDates.length === 0) return null;
	const today = new Date();
	return roastDates.reduce((closest, current) => {
		const closestDate = new Date(closest.date);
		const currentDate = new Date(current.date);
		const closestDiff = Math.abs(today - closestDate);
		const currentDiff = Math.abs(today - currentDate);
		return currentDiff < closestDiff ? current : closest;
	});
};

function AddBeanModal({ isOpen, onClose }) {
	const queryClient = useQueryClient();
	const [newBean, setNewBean] = useState({
		name: "",
		country: "",
		region: "",
		farm: "",
		altitude: "",
		roast: "filter",
	});
	const [newRoastDate, setNewRoastDate] = useState("");

	// Mutation for creating bean
	const createMutation = useMutation({
		mutationFn: async (beanData) => {
			const bean = await createBean(beanData);
			if (newRoastDate) {
				await createRoastDate({
					bean_id: bean.id,
					date: newRoastDate,
				});
			}
			return bean;
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["beans"]);
			onClose();
		},
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await createMutation.mutateAsync({
				name: newBean.name,
				country: newBean.country,
				region: newBean.region,
				farm: newBean.farm,
				altitude: newBean.altitude,
				roast: newBean.roast,
			});

			// Reset form
			setNewBean({
				name: "",
				country: "",
				region: "",
				farm: "",
				altitude: "",
				roast: "filter",
			});
			setNewRoastDate("");
		} catch (err) {
			console.error("Failed to create bean:", err);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Add New Bean</h2>
				<form onSubmit={handleSubmit}>
					<div>
						<label>
							Name:
							<input
								type="text"
								value={newBean.name}
								onChange={(e) =>
									setNewBean({
										...newBean,
										name: e.target.value,
									})
								}
								required
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div>
						<label>
							Country:
							<input
								type="text"
								value={newBean.country}
								onChange={(e) =>
									setNewBean({
										...newBean,
										country: e.target.value,
									})
								}
								required
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div>
						<label>
							Region:
							<input
								type="text"
								value={newBean.region}
								onChange={(e) =>
									setNewBean({
										...newBean,
										region: e.target.value,
									})
								}
								required
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div>
						<label>
							Farm:
							<input
								type="text"
								value={newBean.farm}
								onChange={(e) =>
									setNewBean({
										...newBean,
										farm: e.target.value,
									})
								}
								required
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div>
						<label>
							Altitude:
							<input
								type="text"
								value={newBean.altitude}
								onChange={(e) =>
									setNewBean({
										...newBean,
										altitude: e.target.value,
									})
								}
								required
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div>
						<label>
							Roast:
							<select
								value={newBean.roast}
								onChange={(e) =>
									setNewBean({
										...newBean,
										roast: e.target.value,
									})
								}
								disabled={createMutation.isPending}
							>
								<option>filter</option>
								<option>espresso</option>
								<option>omni</option>
							</select>
						</label>
					</div>
					<div>
						<label>
							Initial Roast Date:
							<input
								type="date"
								value={newRoastDate}
								onChange={(e) =>
									setNewRoastDate(e.target.value)
								}
								disabled={createMutation.isPending}
							/>
						</label>
					</div>
					<div className="modal-actions">
						<button type="button" onClick={onClose}>
							Cancel
						</button>
						<button
							type="submit"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending
								? "Adding..."
								: "Add Bean"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

AddBeanModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default function Beans() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const queryClient = useQueryClient();

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

	// Mutation for deleting bean
	const deleteMutation = useMutation({
		mutationFn: deleteBean,
		onSuccess: (_, beanId) => {
			queryClient.setQueryData(["beans"], (old) =>
				old?.filter((bean) => bean.id !== beanId)
			);
		},
	});

	const handleDelete = async (e, beanId) => {
		e.preventDefault();
		e.stopPropagation();

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this bean? This will affect any brew logs using this bean."
		);
		if (confirmDelete) {
			try {
				await deleteMutation.mutateAsync(beanId);
			} catch (err) {
				console.error("Failed to delete bean:", err);
			}
		}
	};

	if (isInitialLoading) return <Loader />;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<>
			<main className="main-content">
				<button
					className="add-button"
					onClick={() => setIsModalOpen(true)}
				>
					Add Bean
				</button>

				<div className="bean-list">
					{beans.map((bean) => {
						const closestRoastDate = getClosestRoastDate(
							bean.roast_dates
						);
						return (
							<div key={bean.id} className="bean-item">
								<Link
									to={`/beans/${bean.id}`}
									className="bean-details"
								>
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
												closestRoastDate.date
											).toLocaleDateString()}
										</p>
									)}
								</Link>
								<button
									onClick={(e) => handleDelete(e, bean.id)}
									disabled={deleteMutation.isPending}
									className="delete-button"
								>
									{deleteMutation.isPending
										? "Deleting..."
										: "Delete"}
								</button>
							</div>
						);
					})}
				</div>

				<AddBeanModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			</main>
		</>
	);
}

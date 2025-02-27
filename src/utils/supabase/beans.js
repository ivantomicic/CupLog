import { supabase } from "./client";
import { getUserId } from "./utils";

export const getBeans = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("beans")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
};

export const createBean = async (bean) => {
	const userId = await getUserId();

	// Initialize roast_dates array if a date is provided
	const roast_dates = bean.roastDate ? [bean.roastDate] : [];

	console.log(bean);

	const { data, error } = await supabase
		.from("beans")
		.insert([
			{
				user_id: userId,
				name: bean.name,
				country: bean.country,
				region: bean.region,
				farm: bean.farm,
				altitude: bean.altitude,
				roast_type: bean.roastType,
				roastery_id: bean.roastery,
				roast_dates: roast_dates,
			},
		])
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteBean = async (id) => {
	const userId = await getUserId();
	const { error } = await supabase
		.from("beans")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw error;
};

export const updateBean = async (id, updates) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("beans")
		.update(updates)
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

// New function to add a roast date to a bean
export const addRoastDate = async (beanId, date) => {
	// First get the current bean to access its roast_dates
	const { data: bean, error: fetchError } = await supabase
		.from("beans")
		.select("roast_dates")
		.eq("id", beanId)
		.single();

	if (fetchError) throw fetchError;

	// Add the new date to the array
	const updatedRoastDates = [...(bean.roast_dates || []), date];

	// Update the bean with the new roast_dates array
	const { data, error } = await supabase
		.from("beans")
		.update({ roast_dates: updatedRoastDates })
		.eq("id", beanId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

// New function to remove a roast date from a bean
export const removeRoastDate = async (beanId, dateToRemove) => {
	// First get the current bean to access its roast_dates
	const { data: bean, error: fetchError } = await supabase
		.from("beans")
		.select("roast_dates")
		.eq("id", beanId)
		.single();

	if (fetchError) throw fetchError;

	// Filter out the date to remove
	const updatedRoastDates = (bean.roast_dates || []).filter(
		(date) => date !== dateToRemove
	);

	// Update the bean with the filtered roast_dates array
	const { data, error } = await supabase
		.from("beans")
		.update({ roast_dates: updatedRoastDates })
		.eq("id", beanId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

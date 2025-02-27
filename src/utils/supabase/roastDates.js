import { supabase } from "./client";

export const createRoastDate = async ({ coffee_id, date }) => {
	const { data, error } = await supabase
		.from("roast_dates")
		.insert([{ coffee_id, date }])
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteRoastDate = async (id) => {
	const { error } = await supabase.from("roast_dates").delete().eq("id", id);

	if (error) throw error;
};

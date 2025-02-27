import { supabase } from "./client";
import { getUserId } from "./utils";

export const getGrinders = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("grinders")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
};

export const createGrinder = async (grinder) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("grinders")
		.insert([{ ...grinder, user_id: userId }])
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteGrinder = async (id) => {
	const userId = await getUserId();
	const { error } = await supabase
		.from("grinders")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw error;
};

export const updateGrinder = async (id, updates) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("grinders")
		.update(updates)
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

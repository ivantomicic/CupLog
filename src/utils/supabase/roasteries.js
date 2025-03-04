import { supabase } from "./client";
import { uploadImage, getUserId } from "./utils";

export const getRoasteries = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("roasteries")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
};

export const createRoastery = async (roastery) => {
	const userId = await getUserId();

	// Handle image upload if present
	let logoUrl = null;
	if (roastery.logo instanceof File) {
		logoUrl = await uploadImage(roastery.logo, "roastery-logos");
	}

	const { data, error } = await supabase
		.from("roasteries")
		.insert([
			{
				user_id: userId,
				name: roastery.name,
				logo_url: logoUrl,
			},
		])
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteRoastery = async (id) => {
	const userId = await getUserId();
	const { error } = await supabase
		.from("roasteries")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw error;
};

export const updateRoastery = async (id, updates) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("roasteries")
		.update(updates)
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

import { supabase } from "./client";
import { uploadImage, getUserId } from "./utils";

export const getBrewers = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("brewers")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
};

export const createBrewer = async (brewer) => {
	const userId = await getUserId();

	// Handle image upload if present
	let imageUrl = null;
	if (brewer.image instanceof File) {
		imageUrl = await uploadImage(brewer.image, "brewers");
	}

	const { data, error } = await supabase
		.from("brewers")
		.insert([
			{
				user_id: userId,
				name: brewer.name,
				material: brewer.material,
				type: brewer.type,
				image_url: imageUrl,
			},
		])
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteBrewer = async (id) => {
	const userId = await getUserId();
	const { error } = await supabase
		.from("brewers")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw error;
};

export const updateBrewer = async (id, updates) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("brewers")
		.update(updates)
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

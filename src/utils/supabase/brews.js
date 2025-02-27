import { supabase } from "./client";
import { uploadImage, deleteImage, getUserId } from "./utils";

export const getBrews = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("brews")
		.select(
			`
      *,
      bean:beans(*,roast_dates(*)),
      grinder:grinders(*),
      brewer:brewers(*)
    `
		)
		.eq("user_id", userId)
		.order("date", { ascending: false });

	if (error) throw error;
	return data;
};

export const createBrew = async (brew) => {
	const userId = await getUserId();

	// Handle image upload if present
	let imageUrl = null;
	if (brew.image instanceof File) {
		imageUrl = await uploadImage(brew.image, "brew-images");
	}

	const { data, error } = await supabase
		.from("brews")
		.insert([
			{
				user_id: userId,
				beans_id: brew.beansId,
				roast_date_id: brew.roastDateId,
				grinder_id: brew.grinderId,
				brewer_id: brew.brewerId,
				date: brew.date,
				grind_size: brew.grindSize,
				brew_time: parseInt(brew.brewTime),
				dose: parseFloat(brew.dose),
				yield: parseFloat(brew.yield),
				notes: brew.notes,
				image_url: imageUrl,
				ai_suggestions: brew.aiSuggestions,
			},
		])
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteBrew = async (id) => {
	const userId = await getUserId();

	// Get the brew to delete its images if it has any
	const { data: brew } = await supabase
		.from("brews")
		.select("image_url, flow_chart_url")
		.eq("id", id)
		.eq("user_id", userId)
		.single();

	if (brew?.image_url) {
		await deleteImage(brew.image_url, "brew-images");
	}
	if (brew?.flow_chart_url) {
		await deleteImage(brew.flow_chart_url, "flow-charts");
	}

	const { error } = await supabase
		.from("brews")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw error;
};

export const updateBrew = async (id, updates) => {
	const userId = await getUserId();

	// Create a copy of updates to modify
	const brewUpdates = { ...updates };

	// Handle image updates if present
	let imageUrl = updates.image_url;
	let flowChartUrl = updates.flow_chart_url;

	// Get current brew data for image handling
	const { data: oldBrew } = await supabase
		.from("brews")
		.select("image_url, flow_chart_url")
		.eq("id", id)
		.eq("user_id", userId)
		.single();

	// Handle brew image
	if (updates.image instanceof File) {
		if (oldBrew?.image_url) {
			await deleteImage(oldBrew.image_url, "brew-images");
		}
		imageUrl = await uploadImage(updates.image, "brew-images");
	}

	// Handle flow chart image
	if (updates.flow_chart instanceof File) {
		if (oldBrew?.flow_chart_url) {
			await deleteImage(oldBrew.flow_chart_url, "flow-charts");
		}
		flowChartUrl = await uploadImage(updates.flow_chart, "flow-charts");
	}

	const { data, error } = await supabase
		.from("brews")
		.update({
			bean_id: brewUpdates.bean_id,
			roast_date_id: brewUpdates.roast_date_id,
			grinder_id: brewUpdates.grinder_id,
			brewer_id: brewUpdates.brewer_id,
			date: brewUpdates.date,
			grind_size: brewUpdates.grind_size,
			brew_time: parseInt(brewUpdates.brew_time),
			dose: parseFloat(brewUpdates.dose),
			yield: parseFloat(brewUpdates.yield),
			notes: brewUpdates.notes,
			image_url: imageUrl,
			flow_chart_url: flowChartUrl,
			ai_suggestions: brewUpdates.ai_suggestions,
		})
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

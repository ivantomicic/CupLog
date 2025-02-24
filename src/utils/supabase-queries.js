import { supabase } from "./supabase";

// Helper to get current user ID
const getUserId = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("Not authenticated");
	return user.id;
};

// Upload image to storage bucket
const uploadImage = async (file, bucket = "brew-images") => {
	const userId = await getUserId();
	const fileExt = file.name.split(".").pop();
	const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
	const filePath = `${userId}/${fileName}`;

	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(filePath, file);

	if (error) throw error;

	const {
		data: { publicUrl },
	} = supabase.storage.from(bucket).getPublicUrl(filePath);

	return publicUrl;
};

// Delete image from storage bucket
const deleteImage = async (url, bucket = "brew-images") => {
	if (!url) return;

	const path = url.split("/").slice(-2).join("/"); // Get userId/filename
	const { error } = await supabase.storage.from(bucket).remove([path]);

	if (error) throw error;
};

// User profile management
export const updateUserProfile = async (updates) => {
	const userId = await getUserId();

	let avatarUrl = updates.avatar_url;

	// Handle avatar upload if present
	if (updates.avatar instanceof File) {
		// Delete old avatar if exists
		if (updates.avatar_url) {
			await deleteImage(updates.avatar_url, "avatars");
		}

		// Upload new avatar
		avatarUrl = await uploadImage(updates.avatar, "avatars");
	}

	const { data, error } = await supabase
		.from("users")
		.update({ avatar_url: avatarUrl })
		.eq("id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

// Brewers
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
	const { data, error } = await supabase
		.from("brewers")
		.insert([{ ...brewer, user_id: userId }])
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

// Grinders
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

// Coffees
export const getCoffees = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("coffees")
		.select(
			`
      *,
      roast_dates (
        id,
        date
      )
    `
		)
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
};

export const createCoffee = async (coffee) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("coffees")
		.insert([
			{
				...coffee,
				user_id: userId,
				name: coffee.name,
				country: coffee.country,
				region: coffee.region,
				farm: coffee.farm,
				altitude: coffee.altitude,
				roast: coffee.roast,
			},
		])
		.select()
		.single();

	if (error) throw error;

	if (coffee.roastDates?.length > 0) {
		const { error: roastDateError } = await supabase
			.from("roast_dates")
			.insert(
				coffee.roastDates.map((rd) => ({
					coffee_id: data.id,
					date: rd.date,
				}))
			);

		if (roastDateError) throw roastDateError;
	}

	return data;
};

export const deleteCoffee = async (id) => {
	const userId = await getUserId();
	const { error } = await supabase
		.from("coffees")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw error;
};

export const updateCoffee = async (id, updates) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("coffees")
		.update(updates)
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

// Brews
export const getBrews = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("brews")
		.select(
			`
      *,
      coffee:coffees (
        *,
        roast_dates (*)
      ),
      grinder:grinders (*),
      brewer:brewers (*)
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
				coffee_id: brew.coffeeId,
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
			coffee_id: updates.coffee_id,
			roast_date_id: updates.roast_date_id,
			grinder_id: updates.grinder_id,
			brewer_id: updates.brewer_id,
			date: updates.date,
			grind_size: updates.grind_size,
			brew_time: parseInt(updates.brew_time),
			dose: parseFloat(updates.dose),
			yield: parseFloat(updates.yield),
			notes: updates.notes,
			image_url: imageUrl,
			flow_chart_url: flowChartUrl,
			ai_suggestions: updates.ai_suggestions,
		})
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

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

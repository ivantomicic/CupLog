import { supabase } from "./client";
import { uploadImage, deleteImage, getUserId } from "./utils";

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

import { supabase } from "./client";

// Helper to get current user ID
export const getUserId = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("Not authenticated");
	return user.id;
};

// Upload image to storage bucket
export const uploadImage = async (file, bucket = "brew-images") => {
	const userId = await getUserId();
	const fileExt = file.name.split(".").pop();
	const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
	const filePath = `${userId}/${fileName}`;

	const { error } = await supabase.storage
		.from(bucket)
		.upload(filePath, file);

	if (error) throw error;

	const {
		data: { publicUrl },
	} = supabase.storage.from(bucket).getPublicUrl(filePath);

	return publicUrl;
};

// Delete image from storage bucket
export const deleteImage = async (url, bucket = "brew-images") => {
	if (!url) return;

	const path = url.split("/").slice(-2).join("/"); // Get userId/filename
	const { error } = await supabase.storage.from(bucket).remove([path]);

	if (error) throw error;
};

import { supabase } from "./client";
import { getUserId } from "./utils";

export const getBeans = async () => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("beans")
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

export const createBean = async (bean) => {
	const userId = await getUserId();
	const { data, error } = await supabase
		.from("beans")
		.insert([
			{
				...bean,
				user_id: userId,
				name: bean.name,
				country: bean.country,
				region: bean.region,
				farm: bean.farm,
				altitude: bean.altitude,
				roast: bean.roast,
			},
		])
		.select()
		.single();

	if (error) throw error;

	if (bean.roastDates?.length > 0) {
		const { error: roastDateError } = await supabase
			.from("roast_dates")
			.insert(
				bean.roastDates.map((rd) => ({
					coffee_id: data.id,
					date: rd.date,
				}))
			);

		if (roastDateError) throw roastDateError;
	}

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

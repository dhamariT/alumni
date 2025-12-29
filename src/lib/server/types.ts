export type SessionUser = {
	id: string;
	name: string | null;
	email: string | null;
};

export type UserProfile = {
	first_name: string;
	second_name: string;
	email: string;
	user_id: string;
	slack_id: string | null;
	slack_handle: string | null;
	github_username: string | null;
	instagram: string | null;
	linkedin: string | null;
	personal_site: string | null;
	created_at: string;
	birthdate: string | null;
	ysws_eligible: string | null;
	city: string | null;
	state: string | null;
	country: string | null;
	position: string | null;
	company: string | null;
	ex_hq: boolean;
	phone_number: string | null;
	profile_picture: string | null;
};

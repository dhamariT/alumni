export type SessionUser = {
	id: string;
	name: string | null;
	email: string | null;
};

export type Company = {
	company_id: string;
	name: string;
	website: string | null;
};

export type Employment = {
	employment_id: string;
	user_id: string;
	company_id: string;
	title: string;
	start_date: string | null;
	end_date: string | null;
	is_current: boolean;
	company: Company;
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
	ex_hq: boolean;
	phone_number: string | null;
	profile_picture: string | null;
	employments: Employment[];
};

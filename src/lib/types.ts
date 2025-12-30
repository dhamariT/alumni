export interface Company {
	company_id: string;
	name: string;
	website: string | null;
}

export interface Employment {
	employment_id: string;
	user_id: string;
	company_id: string;
	title: string;
	start_date: string | null;
	end_date: string | null;
	is_current: boolean;
	company: Company;
}

export interface UserProfile {
	user_id: string;
	first_name: string;
	second_name: string;
	email: string;
	slack_id: string;
	slack_handle: string;
	github_username: string;
	instagram: string;
	linkedin: string;
	personal_site: string;
	birthdate: string;
	ysws_eligible: string;
	city: string;
	state: string;
	country: string;
	ex_hq: boolean;
	phone_number: string;
	employments: Employment[];
}

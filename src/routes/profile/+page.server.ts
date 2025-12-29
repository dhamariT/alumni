import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { getUser, updateUser } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const profile = await getUser(locals.user.id);

	if (!profile) {
		redirect(302, '/');
	}

	return {
		user: locals.user,
		profile
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();

		const updateData = {
			first_name: formData.get('first_name') as string,
			second_name: formData.get('second_name') as string,
			email: formData.get('email') as string,
			github_username: formData.get('github_username') as string,
			instagram: formData.get('instagram') as string,
			linkedin: formData.get('linkedin') as string,
			personal_site: formData.get('personal_site') as string,
			city: formData.get('city') as string,
			state: formData.get('state') as string,
			country: formData.get('country') as string,
			position: formData.get('position') as string,
			company: formData.get('company') as string,
			phone_number: formData.get('phone_number') as string
		};

		const response = await updateUser(locals.user.id, updateData);

		if (!response.ok) {
			return fail(400, { error: 'Failed to update profile' });
		}

		return { success: true };
	}
};

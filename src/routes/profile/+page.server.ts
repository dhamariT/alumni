import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/server/api';

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

import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { getUser, getUserBySlack } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const slackData = await getUserBySlack(params.slug);

	if (!slackData?.id) {
		error(404, 'User not found');
	}

	const profile = await getUser(slackData.id);

	if (!profile) {
		error(404, 'User not found');
	}

	return {
		user: locals.user,
		profile
	};
};

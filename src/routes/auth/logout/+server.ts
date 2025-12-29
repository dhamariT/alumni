import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.delete('userID', { path: '/' });
	cookies.delete('accessToken', { path: '/' });
	redirect(302, '/');
};

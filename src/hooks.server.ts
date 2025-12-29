import type { Handle } from '@sveltejs/kit';
import { ENCRYPTION_KEY, BACKEND_DOMAIN_NAME, BEARER_TOKEN_BACKEND } from '$env/static/private';
import { createDecipheriv } from 'crypto';

function decryptUserID(hashedUserID: string): string | null {
	try {
		const [ivHex, encrypted] = hashedUserID.split(':');
		const iv = Buffer.from(ivHex, 'hex');
		const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	} catch {
		return null;
	}
}

async function fetchWithFallback(
	path: string,
	options: RequestInit
): Promise<Response> {
	try {
		const response = await fetch(`https://${BACKEND_DOMAIN_NAME}${path}`, options);
		return response;
	} catch {
		return fetch(`http://${BACKEND_DOMAIN_NAME}${path}`, options);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const hashedUserID = event.cookies.get('userID');

	if (hashedUserID) {
		const userID = decryptUserID(hashedUserID);
		if (userID) {
			try {
				const response = await fetchWithFallback(`/users/${userID}`, {
					headers: {
						Authorization: `${BEARER_TOKEN_BACKEND}`
					}
				});

				if (response.ok) {
					const user = await response.json();
					event.locals.user = {
						id: user.user_id,
						name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || null,
						email: user.email || null
					};
				} else {
					event.locals.user = null;
				}
			} catch {
				event.locals.user = null;
			}
		} else {
			event.cookies.delete('userID', { path: '/' });
			event.cookies.delete('accessToken', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};

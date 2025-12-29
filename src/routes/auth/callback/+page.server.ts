import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import {
	HC_OAUTH_CLIENT_SECRET,
	BEARER_TOKEN_BACKEND,
	BACKEND_DOMAIN_NAME,
	ENCRYPTION_KEY
} from '$env/static/private';
import { PUBLIC_HC_OAUTH_CLIENT_ID, PUBLIC_HC_OAUTH_REDIRECT_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';
import { createCipheriv, randomBytes } from 'crypto';

function hashUserID(userID: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
	let encrypted = cipher.update(userID, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return iv.toString('hex') + ':' + encrypted;
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

export const load: PageServerLoad = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');
	const errorDescription = url.searchParams.get('error_description');

	if (error) {
		console.error('OAuth error:', error, errorDescription);
		redirect(302, '/');
	}

	if (!code) {
		console.error('No authorization code received');
		redirect(302, '/');
	}

	try {
		const params = new URLSearchParams({
			client_id: PUBLIC_HC_OAUTH_CLIENT_ID,
			client_secret: HC_OAUTH_CLIENT_SECRET,
			redirect_uri: PUBLIC_HC_OAUTH_REDIRECT_URL,
			code: code,
			grant_type: 'authorization_code'
		});

		const tokenResponse = await fetch('https://identity.hackclub.com/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			console.error('Token exchange failed:', errorData);
			redirect(302, '/');
		}

		const data = await tokenResponse.json();
		const accessToken = data.access_token;

		const meResponse = await fetch('https://identity.hackclub.com/api/v1/me', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!meResponse.ok) {
			console.error('Failed to fetch user from IDV');
			redirect(302, '/');
		}

		const userIDV = await meResponse.json();
		console.log('User fetched successfully from IDV:', userIDV);

		const userResponse = await fetchWithFallback(
			`/users/by-slack/${encodeURIComponent(userIDV.identity.slack_id)}`,
			{
				headers: {
					Authorization: `${BEARER_TOKEN_BACKEND}`
				}
			}
		);

		let user = await userResponse.json();

		if (!user || !user.user_id) {
			console.log('User not found for slack_id, creating new user');

			const createUserResponse = await fetchWithFallback('/users', {
				method: 'POST',
				headers: {
					Authorization: `${BEARER_TOKEN_BACKEND}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					first_name: userIDV.identity.first_name || '',
					second_name: userIDV.identity.last_name || '',
					email: userIDV.identity.primary_email || '',
					slack_id: userIDV.identity.slack_id || '',
					slack_handle: '',
					github_username: '',
					instagram: '',
					linkedin: '',
					personal_site: '',
					birthdate: '',
					ysws_eligible: userIDV.identity.ysws_eligible ? 'true' : 'false',
					city: '',
					state: '',
					country: '',
					position: '',
					company: '',
					ex_hq: false,
					phone_number: ''
				})
			});

			if (!createUserResponse.ok) {
				const errorText = await createUserResponse.text();
				console.error('Failed to create user:', createUserResponse.status, errorText);

				if (createUserResponse.status === 409 && userIDV.identity.primary_email) {
					console.log('User creation conflict, searching by email');
					const emailUserResponse = await fetchWithFallback(
						`/users/by-email/${encodeURIComponent(userIDV.identity.primary_email)}`,
						{
							headers: {
								Authorization: `${BEARER_TOKEN_BACKEND}`
							}
						}
					);

					if (emailUserResponse.ok) {
						user = await emailUserResponse.json();
					}
				}

				if (!user || !user.user_id) {
					redirect(
						302,
						'/?error=' +
							encodeURIComponent(
								'Error creating user, you may need to update your IDV settings in Hack Club Account'
							)
					);
				}
			} else {
				user = await createUserResponse.json();
			}
		}

		if (user && user.user_id && user.first_login) {
			try {
				const patchResponse = await fetchWithFallback(`/users/${user.user_id}`, {
					method: 'PATCH',
					headers: {
						Authorization: `${BEARER_TOKEN_BACKEND}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						first_name: userIDV.identity.first_name || '',
						second_name: userIDV.identity.last_name || '',
						email: userIDV.identity.primary_email || '',
						slack_id: userIDV.identity.slack_id || '',
						ysws_eligible: userIDV.identity.ysws_eligible ? 'true' : 'false'
					})
				});

				if (!patchResponse.ok) {
					console.error('Failed to patch first_login user data');
				} else {
					const updatedUser = await patchResponse.json();
					user = updatedUser;
				}
			} catch (e) {
				console.error('Error patching first_login user', e);
			}
		}

		const hashedUserID = hashUserID(user.user_id);
		cookies.set('userID', hashedUserID, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
		cookies.set('accessToken', accessToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});
		redirect(302, '/home');
	} catch (err) {
		if (isRedirect(err) || isHttpError(err)) {
			throw err;
		}
		console.error('Error exchanging code for token:', err);
		redirect(302, '/');
	}
};

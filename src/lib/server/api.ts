import { BACKEND_DOMAIN_NAME, BEARER_TOKEN_BACKEND } from '$env/static/private';

export async function fetchWithFallback(path: string, options: RequestInit): Promise<Response> {
	try {
		const response = await fetch(`https://${BACKEND_DOMAIN_NAME}${path}`, options);
		return response;
	} catch {
		return fetch(`http://${BACKEND_DOMAIN_NAME}${path}`, options);
	}
}

export async function getUser(userId: string) {
	const response = await fetchWithFallback(`/users/${userId}`, {
		headers: {
			Authorization: BEARER_TOKEN_BACKEND
		}
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export async function updateUser(userId: string, data: Record<string, unknown>) {
	const response = await fetchWithFallback(`/users/${userId}`, {
		method: 'PATCH',
		headers: {
			Authorization: BEARER_TOKEN_BACKEND,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	return response;
}

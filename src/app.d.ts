import type { SessionUser } from '$lib/server/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: SessionUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

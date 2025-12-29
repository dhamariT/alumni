<script lang="ts">
	import type { SessionUser, UserProfile } from '$lib/server/types';

	let { user, profile }: { user: SessionUser | null; profile: UserProfile | null } = $props();
</script>

<nav class="bg-white shadow-sm border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex items-center">
				<a href="/home" class="text-xl font-bold text-red-500">HC Alumni</a>
			</div>

			{#if user}
				<div class="flex items-center gap-6">
					<a href="/home" class="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
					<a href="/profile" class="text-gray-600 hover:text-gray-900 transition-colors">Profile</a>
					<a href="/auth/logout" class="text-red-500 hover:text-red-600 transition-colors">
						Sign out
					</a>
					<div class="flex items-center gap-2">
						<img
							src={profile?.profile_picture ?? '/default-avatar.jpg'}
							alt="Profile"
							class="w-8 h-8 rounded-full object-cover"
						/>
						<span class="text-gray-700 font-medium">{profile?.first_name ?? ''}</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</nav>

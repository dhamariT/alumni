<script lang="ts">
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profile = $derived({ ...data.profile });
	let profilePicturePreview = $derived(data.profile?.profile_picture ?? '/default-avatar.jpg');
	let pictureFormRef = $state<HTMLFormElement | null>(null);
	let fileSizeError = $state<string | null>(null);
	let isSavingPicture = $state(false);

	const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		fileSizeError = null;

		if (file.size > MAX_FILE_SIZE) {
			fileSizeError = 'File size must be less than 2MB';
			input.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = async () => {
			const base64 = reader.result as string;
			const hiddenInput = pictureFormRef?.querySelector(
				'input[name="profile_picture"]'
			) as HTMLInputElement;
			if (hiddenInput) {
				hiddenInput.value = base64;
			}
			isSavingPicture = true;
			pictureFormRef?.requestSubmit();
		};
		reader.readAsDataURL(file);
	}

	function handlePictureFormResult() {
		isSavingPicture = false;
	}
</script>

<Navbar user={data.user} profile={data.profile} />

<main class="max-w-2xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

	{#if form?.success}
		<div class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
			Profile updated successfully!
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
			{form.error}
		</div>
	{/if}

	<div class="flex flex-col items-center gap-4 mb-6">
		<img
			src={profilePicturePreview}
			alt="Profile"
			class="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
		/>
		{#if fileSizeError}
			<p class="text-red-500 text-sm">{fileSizeError}</p>
		{/if}
		{#if isSavingPicture}
			<p class="text-gray-500 text-sm">Saving...</p>
		{/if}
		<div class="flex gap-2">
			<label
				for="profile_picture"
				class="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
			>
				Change Profile Picture
			</label>
			{#if data.profile?.profile_picture}
				<form method="POST" action="?/removePicture" use:enhance={() => { isSavingPicture = true; return async ({ update }) => { isSavingPicture = false; await update(); }; }}>
					<button
						type="submit"
						class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md transition-colors"
					>
						Remove
					</button>
				</form>
			{/if}
		</div>
		<form
			method="POST"
			action="?/updatePicture"
			bind:this={pictureFormRef}
			use:enhance={() => { return async ({ update }) => { isSavingPicture = false; await update(); }; }}
		>
			<input type="hidden" name="profile_picture" value="" />
		</form>
		<input
			type="file"
			id="profile_picture"
			accept="image/*"
			onchange={handleFileChange}
			class="hidden"
		/>
	</div>

	<form method="POST" action="?/updateProfile" class="space-y-6">

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">
					First Name
				</label>
				<input
					type="text"
					id="first_name"
					name="first_name"
					bind:value={profile.first_name}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="second_name" class="block text-sm font-medium text-gray-700 mb-1">
					Last Name
				</label>
				<input
					type="text"
					id="second_name"
					name="second_name"
					bind:value={profile.second_name}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				bind:value={profile.email}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="phone_number" class="block text-sm font-medium text-gray-700 mb-1">
				Phone Number
			</label>
			<input
				type="tel"
				id="phone_number"
				name="phone_number"
				bind:value={profile.phone_number}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
			/>
		</div>

		<hr class="border-gray-200" />
		<h2 class="text-xl font-semibold text-gray-800">Social Links</h2>

		<div>
			<label for="github_username" class="block text-sm font-medium text-gray-700 mb-1">
				GitHub Username
			</label>
			<input
				type="text"
				id="github_username"
				name="github_username"
				bind:value={profile.github_username}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="instagram" class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
			<input
				type="text"
				id="instagram"
				name="instagram"
				bind:value={profile.instagram}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="linkedin" class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
			<input
				type="text"
				id="linkedin"
				name="linkedin"
				bind:value={profile.linkedin}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="personal_site" class="block text-sm font-medium text-gray-700 mb-1">
				Personal Website
			</label>
			<input
				type="url"
				id="personal_site"
				name="personal_site"
				bind:value={profile.personal_site}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
			/>
		</div>

		<hr class="border-gray-200" />
		<h2 class="text-xl font-semibold text-gray-800">Location</h2>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div>
				<label for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
				<input
					type="text"
					id="city"
					name="city"
					bind:value={profile.city}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
				<input
					type="text"
					id="state"
					name="state"
					bind:value={profile.state}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="country" class="block text-sm font-medium text-gray-700 mb-1">Country</label>
				<input
					type="text"
					id="country"
					name="country"
					bind:value={profile.country}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>
		</div>

		<hr class="border-gray-200" />
		<h2 class="text-xl font-semibold text-gray-800">Work</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label for="position" class="block text-sm font-medium text-gray-700 mb-1">Position</label>
				<input
					type="text"
					id="position"
					name="position"
					bind:value={profile.position}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="company" class="block text-sm font-medium text-gray-700 mb-1">Company</label>
				<input
					type="text"
					id="company"
					name="company"
					bind:value={profile.company}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
				/>
			</div>
		</div>

		<hr class="border-gray-200" />
		


		<div class="pt-4">
			<button
				type="submit"
				class="w-full bg-red-500 text-white py-3 px-4 rounded-md font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
			>
				Save Changes
			</button>
		</div>
	</form>
</main>

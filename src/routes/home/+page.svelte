<script lang="ts">
	import type { PageData } from './$types';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<Navbar user={data.user} profile={data.profile} />

<main class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] font-sans">
	<h1 class="text-2xl font-bold mb-2">Hello {data.user.name ?? data.user.email}!</h1>
	<p class="text-gray-600">Welcome to the alumni homepage.</p>
</main>

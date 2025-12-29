<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main>
	<h1>Hack Club Alumni</h1>

	{#if data.user}
		<p>You're signed in as {data.user.name ?? data.user.email}.</p>
		<a href="/home">Go to your homepage →</a>
	{:else}
		<p>Welcome to the Hack Club Alumni network.</p>
		<a href="/auth/login">Sign in with Hack Club</a>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		font-family: system-ui, sans-serif;
	}

	h1 {
		margin-bottom: 1rem;
	}

	a {
		padding: 0.75rem 1.5rem;
		background: #ec3750;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		margin-top: 1rem;
	}

	a:hover {
		background: #d63445;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
	});
</script>

<svelte:head>
	<title>Browser Demo</title>
</svelte:head>

<section class="container">
	<h1>Browser Demo</h1>
</section>

<style>
	.container {
		max-width: 680px;
		margin: auto;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
		gap: 1px;
		margin-bottom: 10px;
	}
	.flex-col {
		display: flex;
		flex-direction: column;
		gap: 1px;
		margin-bottom: 10px;
	}
	.kind1-event {
		border: 1px solid silver;
		max-width: 680px;
		overflow-wrap: break-word;
		padding: 10px;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { schnorr } from '@noble/curves/secp256k1';
	import { bech32 } from '@scure/base';
	import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';

	const Bech32MaxSize = 5000;


	onMount(async () => {
		console.log(window.ssi.bitcoin);
	});

	const inject = async () => {
		if (!window.ssi.bitcoin) {
			return;
		}

		/**
		 * window.ssi.bitcoin
		 */
		console.log('window.ssi.bitcoin: getPublicKey', await window.ssi.bitcoin.getPublicKey());
		window.ssi.bitcoin.addEventListener('accountChanged', accountChangedListenerForSsi);
		window.ssi.bitcoin.addEventListener('providerChanged', providerChangedListenerForSsi);
	};

	const dispose = async () => {
		if (!window.ssi.bitcoin) {
			return;
		}

		/**
		 * window.ssi.bitcoin
		 */
		console.log('window.ssi.bitcoin: getPublicKey', await window.ssi.bitcoin.getPublicKey());
		window.ssi.bitcoin.removeEventListener('accountChanged', accountChangedListenerForSsi);
		window.ssi.bitcoin.removeEventListener('providerChanged', providerChangedListenerForSsi);
	};
</script>

<svelte:head>
	<title>Bitcoin Demo</title>
</svelte:head>

<section class="container">
	<h1>Bitcoin Demo</h1>

	<h2>Generate</h2>

	<h2>Share</h2>

	<h2>Debug</h2>
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

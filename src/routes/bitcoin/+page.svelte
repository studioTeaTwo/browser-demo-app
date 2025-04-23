<script lang="ts">
	import { onMount } from 'svelte';
	import { schnorr } from '@noble/curves/secp256k1';
	import { bech32 } from '@scure/base';
	import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';

	const Bech32MaxSize = 5000;

	let type = "mnemonic";
	let strength = 128;
	let passphrase = "";
	let pubkey = "";
	let xpub = "";

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
		// console.log('window.ssi.bitcoin: getPublicKey', await window.ssi.bitcoin.getPublicKey());
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
		// console.log('window.ssi.bitcoin: getPublicKey', await window.ssi.bitcoin.getPublicKey());
		window.ssi.bitcoin.removeEventListener('accountChanged', accountChangedListenerForSsi);
		window.ssi.bitcoin.removeEventListener('providerChanged', providerChangedListenerForSsi);
	};

	const onClickGenerate = async(e) => {
		const res = await window.ssi.bitcoin.generate({type, strength, passphrase})
		console.log("generate", res);
	}

	const onClickShare = async(e) => {
		const res = await window.ssi.bitcoin.shareWith(pubkey, {type})
		console.log("shareWith", res);
	}

	const accountChangedListenerForSsi = (e) => {
		// If you trun on the "Notify Account Changed", then come here.
		console.log(e);
		console.log(`window.ssi.bitcoin: Account Changed! detail:${e.detail}`);
	};
	const providerChangedListenerForSsi = (e) => {
		// If you enables the prefs, i.e. Enable, Use built-in NIP07, then come here.
		console.log(e);
		console.log(`window.ssi.bitcoin: Provider Changed! detail:${e.detail}`);
	};
</script>

<svelte:head>
	<title>Bitcoin Demo</title>
</svelte:head>

<section class="container">
	<h1>Bitcoin Demo</h1>

	<h2>Generate</h2>
	<div class="flex-row">
		<select name="BitcoinGenerateType" id="BitcoinGenerateType" bind:value={type}>
			<option value="mnemonic">mnemonic</option>
			<option value="derivation">derivation</option>
		</select>
		<input type="number" bind:value={strength} placeholder="strength" />
		<input type="text" bind:value={passphrase} placeholder="passphrase" />
		<button on:click={onClickGenerate}>Generate</button>
	</div>

	<h2>Share</h2>
	<div class="flex-row">
		<select name="BitcoinShareType" id="BitcoinShareType" bind:value={type}>
			<option value="mnemonic">mnemonic</option>
			<option value="derivation">derivation</option>
			<option value="xpriv">xpriv</option>
		</select>
		<input type="text" bind:value={pubkey} placeholder="receiver's npub" />
		<input type="text" bind:value={xpub} placeholder="xpub" />
		<button on:click={onClickShare}>Share</button>
	</div>

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

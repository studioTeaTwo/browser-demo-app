<script lang="ts">
	import { onMount } from 'svelte';
	import { schnorr } from '@noble/curves/secp256k1';
	import { bech32 } from '@scure/base';
	import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';
	import { waitNostr } from "nip07-awaiter";
	import { type Event } from "nostr-typedef";

	const Bech32MaxSize = 5000;

	let npub = '';
	let prevNpub = '';
	let npubChanged = false;

	// Kind1 Issue
	let kind1Text = '';
	let kind1CreatedAt = 0;
	let issuedEvent = {} as Event;

	// NIP-04
	let textNip04 = '';
	let cipherTextNip04 = '';
	let pubkeyNip04 = '';

	// NIP-44
	let textNip44 = '';
	let cipherTextNip44 = '';
	let pubkeyNip44 = '';

	// Debug
	let eventDataForVerify = '';
	let signatureForVerify = '';
	let messageForVerify = '';
	let hexPubkeyForVerify = '';
	let convertedKey = '';

	onMount(async () => {
		console.log(window.ssi);
		console.log(window.nostr);

		const nostrOrUndefined = await waitNostr(1000);
		if (!nostrOrUndefined) {
			console.error("couldn't get window.nostr in 1 second")
		}
		await inject();

		window.addEventListener('providerChanged', providerChangedListenerForWindow);
	});

	const inject = async () => {
		if (!window.nostr) {
			return;
		}

		/**
		 * window.nostr
		 */
		try {
			const pubkey = await window.nostr.getPublicKey();
			npub = encodeToNpub(pubkey);
			console.log('window.nostr: getPublicKey', pubkey);
		} catch (e) {
			// If you disables the prefs, i.e. Enable, Use built-in NIP07 or Use TrustedSites, then come here.
			alert(`NIP-07 is disabled! detail:${e}`);
		}
		window.nostr.addEventListener('accountChanged', accountChangedListener);
		window.nostr.addEventListener('providerChanged', providerChangedListener);

		/**
		 * window.ssi
		 */
		console.log('window.ssi.nostr: getPublicKey', await window.ssi.nostr.getPublicKey());
		window.ssi.nostr.addEventListener('accountChanged', accountChangedListenerForSsi);
		window.ssi.nostr.addEventListener('providerChanged', providerChangedListenerForSsi);
	};

	const dispose = async () => {
		if (!window.nostr) {
			return;
		}

		/**
		 * window.nostr
		 */
		window.nostr.removeEventListener('accountChanged', accountChangedListener);
		window.nostr.removeEventListener('providerChanged', providerChangedListener);

		/**
		 * window.ssi
		 */
		console.log('window.ssi.nostr: getPublicKey', await window.ssi.nostr.getPublicKey());
		window.ssi.nostr.removeEventListener('accountChanged', accountChangedListenerForSsi);
		window.ssi.nostr.removeEventListener('providerChanged', providerChangedListenerForSsi);
	};

	const onClickGetPubkey = async () => {
		const pubkey = await window.nostr.getPublicKey()
		npub = encodeToNpub(pubkey);
		console.log('window.nostr: re-getPublicKey', pubkey);
	}

	const onClickIssueEvent = async (
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) => {
		const nevent = {
			kind: 1,
			tags: [],
			content: kind1Text,
			created_at: kind1CreatedAt === 0 ? Date.now() : kind1CreatedAt
		};
		try {
			issuedEvent = await window.nostr.signEvent(nevent);
		} catch (e) {
			// If you disables the prefs, then dipaly the reason.
			alert(`You can't! detail:${e}`);
		}
	};

	const onClickEncrypt = async(type: 'nip04'| 'nip44') => {
		console.log(`${type} encrypt`);
		if (type === 'nip04') {
			if (!pubkeyNip04) {
				alert(`Input pubkey`);
				return;
			}
			cipherTextNip04 = await window.nostr[type].encrypt(decodeNpub(pubkeyNip04), textNip04)
		} else {
			if (!pubkeyNip44) {
				alert(`Input pubkey`);
				return;
			}
			cipherTextNip44 = await window.nostr[type].encrypt(decodeNpub(pubkeyNip44), textNip44)
		}
	}

	const onClickDecrypt = async(type: 'nip04'| 'nip44') => {
		console.log(`${type} decrypt`);
		if (type === 'nip04') {
			if (!pubkeyNip04) {
				alert(`Input pubkey`);
				return;
			}
			textNip04 = await window.nostr[type].decrypt(decodeNpub(pubkeyNip04), cipherTextNip04)
		} else {
			if (!pubkeyNip44) {
				alert(`Input pubkey`);
				return;
			}
			textNip44 = await window.nostr[type].decrypt(decodeNpub(pubkeyNip44), cipherTextNip44)
		}

	}

	const onClickVerifyEvent = (
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) => {
		const event = JSON.parse(eventDataForVerify);

		let pubkey = event.pubkey;
		if (event.pubkey.startsWith('npub')) {
			pubkey = decodeNpub(pubkey);
		}
		const result = schnorr.verify(event.sig, event.id, pubkey);
		alert(`They are ${result}`);
	};

	const onClickVerify = (
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) => {
		let pubkey = hexPubkeyForVerify || decodeNpub(npub);
		const result = schnorr.verify(signatureForVerify, messageForVerify, pubkey);
		alert(`They are ${result}`);
	};

	const onChangePubConvert = (
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const key = e.target.value;
		convertedKey = key.startsWith('npub') ? decodeNpub(key) : encodeToNpub(key);
	};

	const accountChangedListener = (e) => {
		// If you trun on the "Notify Account Changed", then come here.

		console.log(e);
		prevNpub = npub;
		npub = encodeToNpub(e.detail);
		npubChanged = true;
		alert(`Account Changed! detail:${e.detail}`);
		console.log(`window.nostr: Account Changed! detail:${e.detail}`);
	};
	const providerChangedListener = (e) => {
		// If you enables the prefs, i.e. Enable, Use built-in NIP07, then come here.
		console.log(e);
		alert(`Provider Changed! detail:${e.detail}`);
		console.log(`window.nostr: Provider Changed! window detail:${e.detail}`);
	};
	const providerChangedListenerForWindow = async (e) => {
		// If you enables the prefs, i.e. Enable, Use built-in NIP07, then come here.
		console.log(e);
		alert(`Provider Changed! detail:${e.detail}`);
		console.log(`window: Provider Changed! window detail:${e.detail}`);

		if (e.detail) {
			await inject();
		} else {
			await dispose();
		}
	};
	const accountChangedListenerForSsi = (e) => {
		// If you trun on the "Notify Account Changed", then come here.
		console.log(e);
		console.log(`window.ssi.nostr: Account Changed! detail:${e.detail}`);
	};
	const providerChangedListenerForSsi = (e) => {
		// If you enables the prefs, i.e. Enable, Use built-in NIP07, then come here.
		console.log(e);
		console.log(`window.ssi.nostr: Provider Changed! detail:${e.detail}`);
	};

	function encodeToNpub(pubkey) {
		const words = bech32.toWords(hexToBytes(pubkey));
		return bech32.encode('npub', words, Bech32MaxSize);
	}
	function decodeNpub(npub) {
		const { prefix, words } = bech32.decode(npub, Bech32MaxSize);
		return bytesToHex(new Uint8Array(bech32.fromWords(words)));
	}
</script>

<svelte:head>
	<title>Nostr Demo</title>
</svelte:head>

<section class="container">
	<h1>Nostr Demo</h1>

	{#if npubChanged}
		<p style="color: red; font-weight: bold;">npub changed!</p>
	{/if}
	<p style="font-weight: bold;">NOW: {npub}</p>
	{#if prevNpub}
		<p>PREVIOUS: {prevNpub}</p>
	{/if}
	<div class="flex-row">
		<button on:click={onClickGetPubkey}>Re-get public key</button>
	</div>

	<h2>Kind1 Issue</h2>
	<div class="flex-row">
		<input type="text" bind:value={kind1Text} placeholder="text" />
		<button on:click={onClickIssueEvent}>Issue</button>
	</div>
	<div class="flex-row">
		<label>manually created_at</label>
		<input type="number" bind:value={kind1CreatedAt} placeholder="created_at" />
	</div>
	{#if issuedEvent.sig}
		<p class="kind1-event">{JSON.stringify(issuedEvent)}</p>
	{/if}

	<h2>NIP-04</h2>
	<div class="flex-col">
		<div class="flex-row">
			<label>Conversation partner's pubkey</label>
			<input type="string" bind:value={pubkeyNip04} placeholder="npub1..." />
		</div>
		<div class="flex-row">
			<textarea
				style="min-width: 300px; min-height: 50px; field-sizing: content;"
				placeholder="message to encrypt"
				bind:value={textNip04}
			/>
			<button on:click={() => onClickEncrypt('nip04')}>Encrypt</button>
		</div>
		<div class="flex-row">
			<textarea
				style="min-width: 300px; min-height: 50px; field-sizing: content;"
				placeholder="message to decrypt"
				bind:value={cipherTextNip04}
			/>
			<button on:click={() => onClickDecrypt('nip04')}>Decrypt</button>
		</div>
	</div>

	<h2>NIP-44</h2>
	<div class="flex-col">
		<div class="flex-row">
			<label>Conversation partner's pubkey</label>
			<input type="string" bind:value={pubkeyNip44} placeholder="npub1..." />
		</div>
		<div class="flex-row">
			<textarea
				style="min-width: 300px; min-height: 50px; field-sizing: content;"
				placeholder="message to encrypt"
				bind:value={textNip44}
			/>
			<button on:click={() => onClickEncrypt('nip44')}>Encrypt</button>
		</div>
		<div class="flex-row">
			<textarea
				style="min-width: 300px; min-height: 50px; field-sizing: content;"
				placeholder="message to decrypt"
				bind:value={cipherTextNip44}
			/>
			<button on:click={() => onClickDecrypt('nip44')}>Decrypt</button>
		</div>
	</div>

	<h2>Debug</h2>
	<div class="flex-col">
		<h3>Nostr Event Verification</h3>
		<div class="flex-row">
			<textarea
				style="min-width: 300px; min-height: 200px; field-sizing: content;"
				placeholder="event data"
				bind:value={eventDataForVerify}
			/>
			<button on:click={onClickVerifyEvent}>Verify</button>
		</div>
	</div>
	<div class="flex-col">
		<h3>Message Verification</h3>
		<div class="flex-row">
			<input placeholder="message" bind:value={messageForVerify} />
			<input placeholder="signature" bind:value={signatureForVerify} />
			<input placeholder="public key(hex)" bind:value={hexPubkeyForVerify} />
			<button on:click={onClickVerify}>Verify</button>
		</div>
	</div>
	<div class="flex-col">
		<h3>nostr pubkey ↔︎ raw pubkey</h3>
		<input type="text" placeholder="npub or pub" on:change={onChangePubConvert} />
		{#if convertedKey}
			<p class="kind1-event">{convertedKey}</p>
		{/if}
	</div>
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

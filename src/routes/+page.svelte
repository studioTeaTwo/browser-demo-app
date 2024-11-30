<script lang="ts">
	import { onMount } from "svelte";
  import { schnorr } from '@noble/curves/secp256k1'
  import { bech32 } from '@scure/base'
	import { bytesToHex, hexToBytes } from "@noble/curves/abstract/utils";

  const Bech32MaxSize = 5000

  let npub = ""
  let prevNpub = ""
  let npubChanged = false

  // Kind1 Issue
  let kind1Text = ""
  let kind1CreatedAt = 0
  let issuedEvent = {}

  // Debug
  let eventDataForVerify = ""
  let signatureForVerify = ""
  let messageForVerify = ""
  let hexPubkeyForVerify = ""
  let convertedKey = ""

  onMount(async() => {
    console.log(window.nostr)

    try {
      const pubkey = await window.nostr.getPublicKey()
      npub = encodeToNpub(pubkey)
    } catch(e) {
      // If you disables the prefs, i.e. Enable, Use built-in NIP07 or Use TrustedSites, then come here.
      alert(`NIP-07 is disabled! detail:${e}`)
    }

    window.nostr.addEventListener("accountChanged", (e) => {
      // If you trun on the "Notify Account Changed", then come here.

      console.log(e)
      prevNpub = npub
      npub = encodeToNpub(e.detail)
      npubChanged = true
      alert(`Account Changed! detail:${e}`)
    })
    window.addEventListener("providerChanged", (e) => {
      // If you enables the prefs, i.e. Enable, Use built-in NIP07, then come here.
      console.log(e)
      alert(`Provider Changed! detail:${e}`)
    })
  })

  const onClickIssueEvent = async (e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  }) => {
    const nevent = {
      kind: 1,
      tags: [],
      content: kind1Text,
      created_at: kind1CreatedAt === 0 ? Date.now() : kind1CreatedAt,
    }
    try {
      issuedEvent = await window.nostr.signEvent(nevent)
    } catch (e) {
      // If you disables the prefs, then dipaly the reason.
      alert(`You can't! detail:${e}`)
    }
  }

  const onClickVerifyEvent = (e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  }) => {
    const event = JSON.parse(eventDataForVerify)

    let pubkey = event.pubkey
    if (event.pubkey.startsWith("npub")) {
      pubkey = decodeNpub(pubkey)
    }
    const result = schnorr.verify(event.sig, event.id, pubkey)
    alert(`They are ${result}`)
  }

  const onClickVerify = (e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  }) => {
    let pubkey = hexPubkeyForVerify || decodeNpub(npub)
    const result = schnorr.verify(signatureForVerify, messageForVerify, pubkey)
    alert(`They are ${result}`)
  }

  const onChangePubConvert = (e: Event & {
    currentTarget: EventTarget & HTMLInputElement;
  }) => {
    const key = e.target.value
    convertedKey = key.startsWith("npub") ? decodeNpub(key) : encodeToNpub(key)
  }

  function encodeToNpub(pubkey) {
    const words = bech32.toWords(hexToBytes(pubkey))
    return bech32.encode('npub', words, Bech32MaxSize)
  }
  function decodeNpub(npub) {
    const {prefix, words} = bech32.decode(npub, Bech32MaxSize)
    return bytesToHex(new Uint8Array(bech32.fromWords(words)))
  }
</script>

<svelte:head>
	<title>Nostr Demo</title>
</svelte:head>

<section class="container">
  <h1>Nostr Demo</h1>

  {#if npubChanged }
  <p style="color: red; font-weight: bold;">npub changed!</p>
  {/if}
  <p style="font-weight: bold;">NOW: {npub}</p>
  {#if prevNpub}
  <p>PREVIOUS: {prevNpub}</p>
  {/if}

  <h2>Kind1 Issue</h2>
  <div class="flex-row">
    <input type="text" bind:value={kind1Text} placeholder="text" />
    <button on:click={onClickIssueEvent}>Issue</button>
  </div>
  <div class="flex-row">
    <label>manually created_at</label>
    <input type="number" bind:value={kind1CreatedAt} placeholder="created_at" />
  </div>
  {#if issuedEvent.sig }
  <p class="kind1-event">{JSON.stringify(issuedEvent)}</p>
  {/if}

  <h2>Debug</h2>
  <div class="flex-col">
    <h3>Nostr Event Verification</h3>
    <div class="flex-row">
      <textarea
        style="min-width: 300px; min-height: 200px; field-sizing: content;"
        placeholder="event data"
        bind:value={eventDataForVerify} />
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
    {#if convertedKey }
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
<script lang="ts">
	import { onMount } from "svelte";
  import { schnorr } from '@noble/curves/secp256k1'
  import { bech32 } from '@scure/base'
	import { bytesToHex } from "@noble/curves/abstract/utils";

  let npub = ""
  let prevNpub = ""
  let npubChanged = false

  let kind1Text = ""
  let kind1CreatedAt = 0
  let issuedEvent = {}

  let eventData = ""

  onMount(async() => {
    console.log(window.nostr)
    npub = await window.nostr.getPublicKey()

    window.addEventListener("nostr:accountchanged", (e) => {
      console.log(e)
      prevNpub = npub
      npub = e.detail
      npubChanged = true
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
    issuedEvent = await window.nostr.signEvent(nevent)
  }

  const onClickVerify = (e: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  }) => {
    const event = JSON.parse(eventData)

    const {prefix, words} = bech32.decode(event.pubkey, 5000)
    const pubkey = new Uint8Array(bech32.fromWords(words))
    const result = schnorr.verify(event.sig, event.id, bytesToHex(pubkey))
    alert(`They are ${result}`)
  }
</script>

<section class="container">
  <h1>Nostr Demo</h1>

  {#if npubChanged }
  <p style="color: red; font-weight: bold;">npub changed!</p>
  {/if}
  <p style="font-weight: bold;">NOW: {npub}</p>
  {#if prevNpub}
  <p>PREVIOUS: {prevNpub}</p>
  {/if}

  <h2>kind1</h2>
  <div class="kind1-input">
    <input type="text" bind:value={kind1Text} placeholder="text" />
    <button on:click={onClickIssueEvent}>Issue</button>
  </div>
  <div class="kind1-input">
    <label>debug</label>
    <input type="number" bind:value={kind1CreatedAt} placeholder="created_at" />
  </div>
  {#if issuedEvent.sig }
  <p class="kind1-event">{JSON.stringify(issuedEvent)}</p>
  {/if}

  <h2>debug</h2>
  <div class="kind1-input">
    <textarea bind:value={eventData} placeholder="event data" />
    <button on:click={onClickVerify}>Verify</button>
  </div>
</section>

<style>
  .container {
    max-width: 680px;
    margin: auto;
  }

  .kind1-input {
    display: flex;
    flex-direction: row;
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
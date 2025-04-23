/**
 * That's to empower individuals on the self-sovereign path.<br/><br/>window.ssi is the most accessible API that is widely published on the web, bridging tasks related to credentials, such as signing/decrypting, between the internal module and user land.
 */
export interface WindowSSI extends Omit<EventTarget, "dispatchEvent"> {
  /** @internal */
  _scope: "ssi";
  /** @internal */
  _proxy: EventTarget;
  /** @internal */
  _invoke: (event: CustomEvent) => void;

  bitcoin: WindowSSIBitcoin;
  nostr: WindowSSINostr;
}

/** Implementation list of Bitcoin generation spec. */
export type BitcoinGenerateType = "mnemonic" | "derivation";
/** Implementation list of Bitcoin share spec. */
export type BitcoinShareType = "mnemonic" | "derivation" | "xpriv";
/** Implementation list of Nostr signature spec. */
export type NostrSignType = "signEvent";
/** Implementation list of Nostr encyption spec. */
export type NostrEncryptType = "nip04" | "nip44";
/** Implementation list of Nostr encyption spec. */
export type NostrDecryptType = "nip04" | "nip44";

/**
 * The window.ssi subset for Bitcoin protocol.
 */
export interface WindowSSIBitcoin extends Omit<EventTarget, "dispatchEvent"> {
  /** @internal */
  _proxy: EventTarget;
  /** @internal */
  _invoke: (action: unknown, data: unknown) => void;

  /**
   * Generates Bitcoin key in the specified order. During the execution process, an internal authorization check is performed similar to `browser.ssi.askConsent`.
   *
   * @param options - Direction about the key you want the user to generate
   * @param options.type - The type that specifies the secret you want the user to share: e.g. \"mnemonic\", \"derivation\".
   * @param options.strength - The strength when generating a mnemonic (and a master key). This is required when `type` is \"mnemonic\".
   * @param options.passphrase - The passphrase when generating a mnemonic (and a master key). This is optional when `type` is \"mnemonic\".
   * @param options.path - The Hierarchical Deterministic (HD) path: e.g. \"m/0'/1/2'\". If null (or \"m\") a master key will be generated. The seed specified by the user as the primary will be used. This is required when `type` is \"derivation\".
   * @returns A Promise that will be fulfilled with a `string` of xpub. Returns Promise\\<null\\> if error.
   * @throws If failed
   */
  generate(option: {
    type: BitcoinGenerateType;
    strength?: number; // 128 - 256
    passphrase?: string; // UTF-8 NFKD
    path?: string; // m or m/*
  }): Promise<string>;
  /**
   * Callback type of `generate`.
   *
   * @param callback - A reference to a function that should be called in the near future, when the result is returned. The callback function is passed two arguments - 1. Error object if failed otherwise null, 2. The resulting identifier.
   * @param options - Direction about the key you want the user to generate
   * @param options.type - The type that specifies the secret you want the user to share: e.g. \"mnemonic\", \"derivation\".
   * @param options.strength - The strength when generating a mnemonic (and a master key). This is required when `type` is \"mnemonic\".
   * @param options.passphrase - The passphrase when generating a mnemonic (and a master key). This is optional when `type` is \"mnemonic\".
   * @param options.path - The Hierarchical Deterministic (HD) path: e.g. \"m/0'/1/2'\". If null (or \"m\") a master key will be generated. The seed specified by the user as the primary will be used. This is required when `type` is \"derivation\".
   */
  generateSync(
    callback: (error: Error | null, identifier: string) => unknown,
    option: {
      type: BitcoinGenerateType;
      strength?: number; // 128 - 256
      passphrase?: string; // UTF-8 NFKD
      path?: string; // m or m/*
    }
  ): void;

  /**
   * Pass message and return the signature by Nostr secret key. You should always read the public key without using cache just before sign/encrypt/decrypt, as the user may change their primary key without notifying you. During the execution process, an internal authorization check is performed similar to `browser.ssi.askConsent`.
   *
   * @param pubkey - Your Nostr public key for encrypting the shared secret. Either npub or hex format.
   * @param options - Direction about the secret you want the user to share. \"mnemonic\" and \"derivation\" use the seed specified by the user as the primary.
   * @param options.type - The type that specifies the secret you want the user to share: e.g. \"mnemonic\", \"derivation\", \"xpriv\".
   * @param options.xpub - The Bitcoin public key that specifies the secret you want the user to share: e.g. \"xpub123...\". The return value is xpriv key. This is required when `type` is \"xpriv\".
   * @param options.path - The Hierarchical Deterministic (HD) path that specifies the secret you want the user to share: e.g. \"m/0'/1/2'\". The return value is xpriv key. The seed specified by the user as the primary will be used. This is required when `type` is \"derivation\".
   * @returns A Promise that will be fulfilled with `string` of the encrypted secret. Returns Promise\\<null\\> if error."
   * @throws If failed
   */
  shareWith(
    pubkey: string,
    option: {
      type: BitcoinShareType;
      xpub?: string;
      path?: string; // m or m/*
    }
  ): Promise<string>;
  /**
   * Callback type of `shareWith`.
   *
   * @param callback - A reference to a function that should be called in the near future, when the result is returned. The callback function is passed two arguments - 1. Error object if failed otherwise null, 2. The resulting `ssi.bitcoin.SharedSecret`.
   * @param pubkey - Your Nostr public key for encrypting the shared secret. Either npub or hex format.
   * @param options - Direction about the secret you want the user to share. \"mnemonic\" and \"derivation\" use the seed specified by the user as the primary.
   * @param options.type - The type that specifies the secret you want the user to share: e.g. \"mnemonic\", \"derivation\", \"xpriv\".
   * @param options.xpub - The Bitcoin public key that specifies the secret you want the user to share: e.g. \"xpub123...\". The return value is xpriv key. This is required when `type` is \"xpriv\".
   * @param options.path - The Hierarchical Deterministic (HD) path that specifies the secret you want the user to share: e.g. \"m/0'/1/2'\". The return value is xpriv key. The seed specified by the user as the primary will be used. This is required when `type` is \"derivation\".
   */
  shareWithSync(
    pubkey: string,
    callback: (error: Error | null, signature: string) => unknown,
    option: {
      type: BitcoinShareType;
      xpub?: string;
      path?: string; // m or m/*
    }
  ): void;
}

/**
 * The window.ssi subset for Nostr protocol.
 */
export interface WindowSSINostr extends Omit<EventTarget, "dispatchEvent"> {
  /** @internal */
  _proxy: EventTarget;
  /** @internal */
  _invoke: (action: unknown, data: unknown) => void;

  /** @ignore */
  generate(options?: object): Promise<string>;

  /**
   * Return public key set as primary currently. During the execution process, an internal authorization check is performed similar to `browser.ssi.askConsent`.
   *
   * @param options - Not implemented
   * @returns A Promise that will be fulfilled with a `string` of public key.
   * @throws If failed
   */
  getPublicKey(options?: object): Promise<string>;
  /**
   * Callback type of `getPublicKey`.
   *
   * @param callback - A reference to a function that should be called in the near future, when the result is returned. The callback function is passed two arguments - 1. Error object if failed otherwise null, 2. The resulting public key.
   * @param options - Not implemented
   */
  getPublicKeySync(
    callback: (error: Error | null, publicKey: string) => unknown,
    options?: object
  ): void;

  /**
   * Pass message and return the signature by Nostr secret key. You should always read the public key without using cache just before sign/encrypt/decrypt, as the user may change their primary key without notifying you. During the execution process, an internal authorization check is performed similar to `browser.ssi.askConsent`.
   *
   * @param message - The message to sign. If it's not a string it must be stringified.
   * @param options - Direction about sign detail
   * @param options.type - The signature spec. e.g., 'signEvent'
   * @returns A Promise that will be fulfilled with a `string` of resulting signature.
   * @throws If failed
   */
  sign(
    message: string,
    options: {
      type: NostrSignType;
    }
  ): Promise<string>;
  /**
   * Callback type of `sign`.
   *
   * @param message - The message to sign. If it's not a string it must be stringified.
   * @param callback - A reference to a function that should be called in the near future, when the result is returned. The callback function is passed two arguments - 1. Error object if failed otherwise null, 2. The resulting signature.
   * @param options - Direction about sign detail
   * @param options.type - e.g., 'signEvent'
   */
  signSync(
    message: string,
    callback: (error: Error | null, signature: string) => unknown,
    options: {
      type: NostrSignType;
    }
  ): void;

  /**
   * Pass plain text and return the cipher text by Nostr secret key. You should always read the public key without using cache just before sign/encrypt/decrypt, as the user may change their primary key without notifying you. During the execution process, an internal authorization check is performed similar to `browser.ssi.askConsent`.
   *
   * @param plaintext - The message to sign. If it's not a string it must be stringified.
   * @param options - Direction about sign detail
   * @param options.type - The encryption spec. e.g., 'nip04', 'nip44'
   * @param options.pubkey - The conversation partner's public key. If type is 'nip04' or 'nip44', then this is required.
   * @param options.version - The version to define encryption algorithms if the type is 'nip44'.
   * @returns A Promise that will be fulfilled with a `string` of resulting signature.
   * @throws If failed
   */
  encrypt(
    plaintext: string,
    options: {
      type: NostrEncryptType;
      pubkey?: string;
      version?: string;
    }
  ): Promise<string>;
  /**
   * Callback type of `encrypt`.
   *
   * @param plaintext - The message to sign. If it's not a string it must be stringified.
   * @param callback - A reference to a function that should be called in the near future, when the result is returned. The callback function is passed two arguments - 1. Error object if failed otherwise null, 2. The resulting ciphertext.
   * @param options - Direction about sign detail
   * @param options.type - The encryption spec. e.g., 'nip04', 'nip44'
   * @param options.pubkey - The conversation partner's public key. If type is 'nip04' or 'nip44', then this is required.
   * @param options.version - The version to define encryption algorithms if the type is 'nip44'.
   */
  encryptSync(
    plaintext: string,
    callback: (error: Error | null, ciphertext: string) => unknown,
    options: {
      type: NostrEncryptType;
      pubkey?: string;
      version?: string;
    }
  ): void;

  /**
   * Pass cipher text and return the plain text by Nostr secret key. You should always read the public key without using cache just before sign/encrypt/decrypt, as the user may change their primary key without notifying you. During the execution process, an internal authorization check is performed similar to `browser.ssi.askConsent`.
   *
   * @param ciphertext - The cipher text to decrypt
   * @param options - Direction about sign detail
   * @param options.type - The encryption spec. e.g., 'nip04', 'nip44'
   * @param options.pubkey - The conversation partner's public key. If type is 'nip04' or 'nip44', then this is required.
   * @param options.version - The version to define encryption algorithms if the type is 'nip44'.
   * @returns A Promise that will be fulfilled with a `string` of resulting signature.
   * @throws If failed
   */
  decrypt(
    ciphertext: string,
    options: {
      type: NostrDecryptType;
      pubkey?: string;
      version?: string;
    }
  ): Promise<string>;
  /**
   * Callback type of `decrypt`.
   *
   * @param ciphertext - The cipher text to decrypt
   * @param callback - A reference to a function that should be called in the near future, when the result is returned. The callback function is passed two arguments - 1. Error object if failed otherwise null, 2. The resulting plaintext.
   * @param options - Direction about sign detail
   * @param options.type - The encryption spec. e.g., 'nip04', 'nip44'
   * @param options.pubkey - The conversation partner's public key. If type is 'nip04' or 'nip44', then this is required.
   * @param options.version - The version to define encryption algorithms if the type is 'nip44'.
   */
  decryptSync(
    ciphertext: string,
    callback: (error: Error | null, plaintext: string) => unknown,
    options: {
      type: NostrDecryptType;
      pubkey?: string;
      version?: string;
    }
  ): void;

  /** @ignore */
  messageBoard?: unknown;
}

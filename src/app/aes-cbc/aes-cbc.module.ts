import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {bigintToBuf, bufToBigint, bufToHex, hexToBuf} from "bigint-conversion";


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class AESCBCModule {

  /**
   * Generate a new key (for symmetric algorithms) or key pair (for public-key algorithms).
   *
   * Syntax :  const result = crypto.subtle.generateKey(algorithm, extractable, keyUsages);
   *
   * @Params{algorithm}  is a dictionary object defining the type of key to generate and providing extra algorithm-specific parameters.
   *
   * @Params{extractable} is a Boolean indicating whether it will be possible to export  the key using SubtleCrypto.exportKey() or SubtleCrypto.wrapKey().
   *
   * @Params{keyUsages} is an Array indicating what can be done with the newly generated key.
   *
   * @returns {Promise} result is a Promise that fulfills with a CryptoKey (for symmetric algorithms) or a CryptoKeyPair (for public-key algorithms).
   *
   */
  static async generateKey(){
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256, //can be  128, 192, or 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * The encrypt() method of the SubtleCrypto interface encrypts data.
   * It takes as its arguments a key to encrypt with, some algorithm-specific parameters, and the data to encrypt (also known as "plaintext").
   * It returns a Promise which will be fulfilled with the encrypted data (also known as "ciphertext").
   *
   * Syntax :  const result = crypto.subtle.encrypt(algorithm, key, data);
   *
   * @Params{algorithm} is an object specifying the algorithm to be used and any extra parameters if required.
   *
   * @Params{key} is a CryptoKey containing the key to be used for encryption.
   *
   * @Params{data} encoded: is a BufferSource containing the data to be encrypted (also known as the plaintext).
   *
   * @returns {Promise} encrypted : result is a Promise that fulfills with an ArrayBuffer containing the "ciphertext".
   *
   */
  static async encryptMessage(message, key, iv) {
    let enc = new TextEncoder();
    let encoded = enc.encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key, //from generateKey or importKey above
      encoded //ArrayBuffer of data you want to encrypt
    );
    return bufToBigint(encrypted);
  }

  /**
   * The decrypt() method of the SubtleCrypto interface decrypts some encrypted data.
   * It takes as arguments a key to decrypt with, some optional extra parameters, and the data to decrypt (also known as "ciphertext").
   * It returns a Promise which will be fulfilled with the decrypted data (also known as "plaintext").
   *
   * Syntax :  const result = crypto.subtle.decrypt(algorithm, key, data);
   *
   * @Params{algorithm}  is an object specifying the algorithm to be used, and any extra parameters as required.
   * The values given for the extra parameters must match those passed into the corresponding encrypt() call.
   *
   * @Params{key} is a CryptoKey containing the key to be used for decryption.
   * If using RSA-OAEP, this is the privateKey property of the CryptoKeyPair object.
   *
   * @Params{ciphertext}  is a BufferSource containing the data to be decrypted (also known as ciphertext).
   *
   * @returns {Promise} ciphertext : result is a Promise that fulfills with an ArrayBuffer containing the plaintext.
   *
   */
  static async decryptMessage(ciphertext, key, iv) {
    ciphertext = bigintToBuf(ciphertext);
    return  await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv, //The initialization vector you used to encrypt
      },
      key,
      ciphertext
    );
  }

  /**
   * The importKey() method of the SubtleCrypto interface imports a key:
   * that is, it takes as input a key in an external, portable format and gives you a CryptoKey object that you can use in the Web Crypto API.
   *
   * Syntax :  const result = crypto.subtle.importKey(
                     format,
                     keyData,
                     algorithm,
                     extractable,
                     usages
                     );
   *
   * @Params{format}  is a string describing the data format of the key to import.
   *
   * @Params{keyData} is an ArrayBuffer, a TypedArray, a DataView, or a JSONWebKey object containing the key in the given format.
   *
   * @Params{algorithm} is a dictionary object defining the type of key to import and providing extra algorithm-specific parameters.
   *
   * @Params{extractable} is a Boolean indicating whether it will be possible to export the key using SubtleCrypto.exportKey() or SubtleCrypto.wrapKey().
   *
   * @Params{keyUsages} is an Array indicating what can be done with the key.
   *
   * @returns {Promise} result is a Promise that fulfills with the imported key as a CryptoKey object
   *
   */
  static async importKey(key){
    return await crypto.subtle.importKey(
      "jwk", {
        alg: "A256CBC",
        ext: true,
        k: key,
        key_ops: ["encrypt", "decrypt"],
        kty: "oct",
      },
      "AES-CBC",
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"]);
  }

}

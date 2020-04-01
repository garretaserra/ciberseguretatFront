import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {bufToHex, hexToBuf} from "bigint-conversion";


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class AESCBCModule {



  static async generateKey(){
   const jwk = await window.crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256, //can be  128, 192, or 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    return jwk;
  }

  /*
   Get the encoded message, encrypt it and display a representation
   of the ciphertext in the "Ciphertext" element.
   //returns an ArrayBuffer containing the encrypted data
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
    return bufToHex(encrypted);
  }

  /*
   Fetch the ciphertext and decrypt it.
   //returns an ArrayBuffer containing the decrypted data
  */
  static async decryptMessage(ciphertext, key, iv) {
    ciphertext = hexToBuf(ciphertext);
    return  await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv, //The initialization vector you used to encrypt
      },
      key,
      ciphertext
    );
  }



}

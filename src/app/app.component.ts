import { Component } from '@angular/core';
import {GeneralService} from './services/general.service';
// @ts-ignore
import my_rsa from 'my_rsa';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  testInputText = '';
  testResponseText = '';

  publicKey = '';
  blindSignatureRequest = '';
  blindSignatureResponse = '';

  constructor(
    private messageService: GeneralService
  ) {
    const s = new my_rsa();
    console.log(s.encrypt(my_rsa.encodeString('hola')));
  }

  async getButton() {
    this.testResponseText = (await this.messageService.messageGet(this.testInputText).toPromise()).message;
  }

  async postButton() {
    this.testResponseText = (await this.messageService.messagePost(this.testInputText).toPromise()).message;
  }

  async getPublicKeyButton() {
    this.publicKey = await this.messageService.getPublicKey().toPromise();
  }

  async getBlindSignature() {

  }

}

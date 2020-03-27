import { Component } from '@angular/core';
import {GeneralService} from './services/general.service';
// @ts-ignore
import my_rsa from 'my_rsa';
import {bigintToHex, bigintToText, hexToBigint, textToBigint} from 'bigint-conversion';
import {ChatService} from "./services/chat.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  rsa;

  testInputText = '';
  testResponseText = '';

  serverPublicKey = '';
  blindSignatureRequest = '';
  blindSignatureResponse = '';
  serverE;
  serverN;
  verifiedCheckBox = false;


  constructor(
    private generalService: GeneralService,
    private ChatService: ChatService
  ) {
    this.rsa = new my_rsa();
  }

  ngOnInit() {
    this.ChatService.getMessages().subscribe((message: String)=>{
      console.log(message);
    })
  }

  async getButton() {
    this.testResponseText = (await this.generalService.messageGet(this.testInputText).toPromise()).message;
  }

  async postButton() {
    this.testResponseText = (await this.generalService.messagePost(this.testInputText).toPromise()).message;
  }

  async getPublicKeyButton() {
    const response =  await this.generalService.getPublicKey().toPromise();
    this.serverPublicKey = JSON.stringify(response);
    const object = JSON.parse(this.serverPublicKey);
    this.serverN = hexToBigint(object.n);
    this.serverE = hexToBigint(object.e);
  }

  async getBlindSignature() {
    const message = textToBigint(this.blindSignatureRequest);
    if (!message) {
      alert('No message');
      return ;
    }

    if (!(this.serverE && this.serverN)) {
      alert('Get public key first');
      return ;
    }

    //Blind message
    const res = my_rsa.blind(message, this.serverE, this.serverN);
    const blindedMessage = bigintToHex(res.blindedMessage);
    //Get r for unblinding
    const r = res.r;

    // Make blind signature request to server
    let blindedSignature = (await this.generalService.signMessage(blindedMessage).toPromise()).signature;

    // UnBlind signature
    blindedSignature = hexToBigint(blindedSignature);
    const signature = my_rsa.unBlind(blindedSignature, r, this.serverN);
    //Get hex value of the blinded signature so it can be displayed
    this.blindSignatureResponse = bigintToHex(signature);

    // Verify that the server has signed the message
    const verification = my_rsa.verify(signature, this.serverE, this.serverN);
    const checkMessage = bigintToText(verification);
    if (checkMessage === this.blindSignatureRequest) {
      this.verifiedCheckBox = true;
    }
  }

  doNothing(event: Event) {
    event.preventDefault();
  }

  emmit() {
    this.ChatService.login();
  }

  getConnectedList(){}

}

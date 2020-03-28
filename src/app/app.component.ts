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

  //Test Server
  testInputText = '';
  testResponseText = '';

  //Blind signature
  serverPublicKey = '';
  blindSignatureRequest = '';
  blindSignatureResponse = '';
  serverE;
  serverN;
  verifiedCheckBox = false;

  //No Repudiation
  username = '';
  userList = [];
  selectedUser: any = '';
  noRepudiationMessage = '';

  constructor(
    private generalService: GeneralService,
    private ChatService: ChatService
  ) {
    this.rsa = new my_rsa();
  }

  ngOnInit() {
    this.handleNewUsers();
    this.handlePrivateMessages();
    this.handlePublishedMessages()
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

  login() {
    this.ChatService.login(this.username, this.rsa.publicKey);
  }

  selectUser(user) {
    this.selectedUser = user;
  }

  handleNewUsers(){
    this.ChatService.getConnected().subscribe((message: string)=>{
      console.log(JSON.parse(message));
      this.userList = JSON.parse(message);
      this.userList = this.userList.filter((user)=>{
        if(user.username !== this.username)
          return user
      })
    })
  }

  startNonRepudiableMessage(){
    const m = this.noRepudiationMessage;
    //TODO: Symmetrically encrypt message c=m+k

    //Temporary until above is completed
    let c = m;

    //Build message
    let message1 = {
      messageType: 'noRepudiation1',
      body:{
        origin: this.username,
        destination: this.selectedUser.username,
        c: c,
        timestamp: 'put timestamp here'
      },
      signature: 'alice signature of the body'
    };

    this.ChatService.sendMessageToUser(message1, this.selectedUser.id);
  }

  handlePrivateMessages(){
    this.ChatService.privateMessages().subscribe((message: any)=>{
      console.log('received message ', message);
      if(message.messageType === 'noRepudiation1')
        this.answerNonRepudiableMessage(message);
      else if (message.messageType === 'noReudiation2')
        this.publishNoRepudiationMessage(message);
    })
  }

  answerNonRepudiableMessage(message){
    //Receives fist message of No repudiation from Alice and sends answers with second message to Alice
    //TODO: Check signature of message sender

    //TODO: Sign the message
    console.log('answer', message);

    //refactoring message
    message.body.destination = message.body.origin;
    message.body.origin = this.username;
    message.messageType = 'noRepudiation2';
    message.signature = 'bob signature of the body';

    //Find destination user
    let dstUser;
    this.userList.some((user)=>{
      if(user.username === message.body.destination){
        //Send message
        this.ChatService.sendMessageToUser(message, user.id);
        return true;
      }
    });
  }

  publishNoRepudiationMessage(message){
    //Receives answer from Bob (2nd message of no repudiation) and sends message to publish to TTP (3rd message of no repudiation)

    //TODO: Check signature

    // Refactor message
    message.messageType = 'noRepudiation3';
    message.body.destination = 'TTP';
    message.body.destination2 = message.body.origin;
    message.body.origin = this.username;
    message.body.k = 'symmetric key';

    //TODO: Sign message body
    message.signature = 'Pko';

    this.ChatService.publishMessage(message);
  }

  handlePublishedMessages(){
    this.ChatService.receiveBroadcastsNoRepudiation().subscribe((message: any)=>{
      //TODO: Analyse published message to see if you are Alice or Bob and display info
    })
  }
}

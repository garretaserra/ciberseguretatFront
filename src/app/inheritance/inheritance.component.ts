import { Component, OnInit } from '@angular/core';
import {User} from "../models/User";
import {bigintToHex, bufToText, hexToBigint} from "bigint-conversion";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GeneralService} from "../services/general.service";
import {ChatService} from "../services/chat.service";
// @ts-ignore
import my_rsa from 'my_rsa';
import {NoRepudiationUser} from "../models/NoRepudiationUser";
import * as cryptoUtils from "bigint-crypto-utils";
import BigNumber from "bignumber.js";
import {IPoint} from "../models/IPoint";
import {ShamirsSecretService} from "../services/shamirs-secret.service";
import {AESCBCModule} from "../aes-cbc/aes-cbc.module";
import {NoRepudiationBody} from "../models/NoRepudiationBody";
import {digest} from "object-sha";
import {NoRepudiationMessage} from "../models/NoRepudiationMessage";
import {NoRepudiationPopUpComponent} from "../no-repudiation-pop-up/no-repudiation-pop-up.component";
import {InheritanceConfirmationPopUpComponent} from "../inheritance-confirmation-pop-up/inheritance-confirmation-pop-up.component";

@Component({
  selector: 'app-inheritance',
  templateUrl: './inheritance.component.html',
  styleUrls: ['./inheritance.component.css']
})
export class InheritanceComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private generalService: GeneralService,
    private ChatService: ChatService,
    private shamirsSecretSharing: ShamirsSecretService,
  ) {
    this.rsa = new my_rsa();
  }

  rsa;
  username = '';
  connectedUserList: User[];
  selectedUsers: NoRepudiationUser[] = [];
  walletSecret = '';
  c: bigint;
  t: number;
  Po: bigint;
  lockLoginButton :boolean = false;

  modulus: BigNumber;

  serverE;
  serverN;

  ngOnInit() {
    this.handleNewUsers();
    this.handlePrivateMessages();
    this.handlePublishedMessages();

    //Generate a new random Modulus
    cryptoUtils.prime(64, 5).then((prime)=>{
      this.modulus = new BigNumber(prime.toString());
      console.log('MODULUS', this.modulus.toString());
    })

    // Get public key of TTP
    this.generalService.getPublicKey().toPromise().then((response)=>{
      this.serverN = hexToBigint(response.n);
      this.serverE = hexToBigint(response.e);
    })
  }

  getConnectedUserFromUsername(username: string): User{
    for(let i = 0; i < this.connectedUserList.length; i++){
      let user = this.connectedUserList[i];
      if (user.username === username)
        return  user;
    }
    return undefined;
  }

  getSelectedUserFromUsername(username: string): NoRepudiationUser{
    for(let i = 0; i < this.selectedUsers.length; i++){
      let user = this.selectedUsers[i];
      if (user.user.username === username)
        return  user;
    }
    return undefined;
  }

  login() {
    if (!this.username){
      alert('No username specified');
      return;
    }
    this.ChatService.login(this.username, JSON.stringify(
      {e: bigintToHex(this.rsa.publicKey.e), n: bigintToHex(this.rsa.publicKey.n)}
      ));
    this.snackBar.open('Logged in','ok', {duration: 1000});
    this.lockLoginButton = true;
  }

  selectUser(user) {
    this.selectedUsers.push({user: user});
  }

  checkIfSelected(user){
    for(let noRepudiationUser of this.selectedUsers){
      if(user.username === noRepudiationUser.user.username)
        return true;
    }
    return false;
  }

  handleNewUsers() {
    this.ChatService.getConnected().subscribe((message: string) => {
      //Remove own username from connected users list
      this.connectedUserList = (JSON.parse(message)).filter((user) => {
        if (user.username !== this.username) {
          return user;
        }
      });
    });
  }

  deselectUser(username: string){
    for(let i = 0; i<this.selectedUsers.length; i++){
      if(this.selectedUsers[i].user.username === username)
        this.selectedUsers.splice(i, 1);
      break;
    }
  }

  checkTimeout(time: string){
    const localTimestamp = Date.now();
    const remoteTimestamp = parseInt(time, 10);
    const maxDiffTime = 2 * 60 * 1000; // 2 minutes
    const calcDiffTime = (localTimestamp - remoteTimestamp);
    return calcDiffTime < 0 || calcDiffTime > maxDiffTime;
  }

  start() {
    // Generate secret parts
    let points: IPoint<string>[] =
      this.shamirsSecretSharing.getPoints(this.selectedUsers.length, this.t, this.modulus, this.walletSecret);

    //Assign secrets to selected users
    this.selectedUsers.forEach((selectedUser, index)=>{
      selectedUser.c = points[index].x.toString() + ',' + points[index].y.toString();
    })

    //Start no repudiation with each selected user
    this.selectedUsers.forEach((selectedUser, index)=>{
      this.startNonRepudiableMessage(selectedUser);
    })
  }

  handlePrivateMessages() {
    this.ChatService.privateMessages().subscribe((message: any) => {
      if (message.messageType === 'noRepudiation1') {
        this.answerNonRepudiableMessage(message);
      } else if (message.messageType === 'noRepudiation2') {
        this.publishNoRepudiationMessage(message);
      }
    });
  }

  async startNonRepudiableMessage(user: NoRepudiationUser) {
    // Encrypt the message
    const iv = await window.crypto.getRandomValues(new Uint8Array(16));
    const jwk = await AESCBCModule.generateKey(); // Generated key in jwk format
    let key = await crypto.subtle.exportKey('jwk', jwk); // Export generated key
    let c: bigint = await AESCBCModule.encryptMessage(user.c, jwk, iv); // Blind Message

    // Encrypt blinded message with Bob's public key
    c = my_rsa.encrypt(c, hexToBigint(user.user.publicKey.e), hexToBigint(user.user.publicKey.n));
    user.c = bigintToHex(c);

    // Save Key. Key is formed by k and iv.
    user.symKey = {
      k: key.k,
      iv: String.fromCharCode.apply(null, iv) // Convert iv to String
    };

    // Get timestamp
    const timestamp = Date.now().toString();

    // Build message
    const body: NoRepudiationBody = {
      origin: this.username,
      destination: user.user.username,
      c: bigintToHex(c),
      timestamp: timestamp
    };

    const hash = await digest(body);
    const Po = bigintToHex(this.rsa.sign(hexToBigint(hash)));

    const message: NoRepudiationMessage = {
      messageType: 'noRepudiation1',
      body,
      signature: Po
    };

    console.log('Message sent', message, 'to ', user.user.username);
    this.ChatService.sendMessageToUser(message, user.user.id);
  }

  async answerNonRepudiableMessage(message) {
    //Receives fist message of No repudiation from Alice and sends answers with second message to Alice
    console.log('Received message', message);

    // Check timestamp
    if (this.checkTimeout(message.body.timestamp)){
      alert('Timestamp error');
      return;
    }

    // Check signature
    let hash = await digest(message.body);

    // Get public key of sender
    let user = this.getConnectedUserFromUsername(message.body.origin);
    let key = user.publicKey;

    // Verify signature is correct
    let sig = my_rsa.verify(hexToBigint(message.signature), hexToBigint(key.e), hexToBigint(key.n));
    if(hexToBigint(hash) !== sig){
      alert('Verification of Po failed');
      return ;
    }
    else {
      console.log('Verification of Po passed', hash);
      this.Po = hexToBigint(message.signature);
    }

    const confirmationDialog = this.dialog.open(InheritanceConfirmationPopUpComponent, {
      width: '200px',
      data: {username: message.body.origin, Po: bigintToHex(this.Po)}
    });
    confirmationDialog.afterClosed().subscribe(result=>{
      // If message wants to be received, continue with no repudiation otherwise do nothing
      if(result === 'accept')
        this.continueAnswerNoRepudiation(message);
    });
  }

  async continueAnswerNoRepudiation(message){
    message.body.destination = message.body.origin;
    message.body.origin = this.username;
    message.body.timestamp = Date.now().toString();// Get timestamp

    // Get Proof of Reception: Pr
    let hash = await digest(message.body);
    message.signature = bigintToHex(this.rsa.sign(hexToBigint(hash)));

    // Save Cipher locally and remove it from message
    this.c = hexToBigint(message.body.c);
    delete message.body.c;

    // Decrypt blinded message
    this.c = this.rsa.decrypt(this.c);

    message.messageType = 'noRepudiation2';

    // Send response message
    let user = this.getConnectedUserFromUsername(message.body.destination);
    this.ChatService.sendMessageToUser(message, user.id);
    console.log('Message sent', message);
  }

  async publishNoRepudiationMessage(message) {
    // Receives answer from Bob (2nd message of no repudiation) and sends message to publish to TTP (3rd message of no repudiation)
    console.log('Received message', message);

    // Check timestamp
    if (this.checkTimeout(message.body.timestamp)){
      alert('Timestamp error');
      return;
    }

    let sender = this.getConnectedUserFromUsername(message.body.origin);

    //Find noRepudiationUser from sender
    let noRepudiationUser = this.getSelectedUserFromUsername(message.body.origin);
    message.body.c = noRepudiationUser.c;

    // Check signature
    let hash = await digest(message.body);

    // Get public key of sender
    let key = sender.publicKey;
    let sig = my_rsa.verify(hexToBigint(message.signature), hexToBigint(key.e), hexToBigint(key.n));
    if (hexToBigint(hash) !== sig) {
      alert('Verification of Pr failed');
      return;
    } else{
      console.log('Verification of Pr passed', hash);
      noRepudiationUser.Pr = message.signature;
    }

    // Refactor message
    message.messageType = 'noRepudiation3';
    message.body.destination = 'TTP';
    message.body.destination2 = message.body.origin;
    message.body.origin = this.username;
    message.body.k = noRepudiationUser.symKey;
    message.body.timestamp = Date.now().toString();

    // Get Proof of Reception of K: Pko
    hash = await digest(message.body);
    message.signature = bigintToHex(this.rsa.sign(hexToBigint(hash)));

    console.log('Message sent', message);
    this.ChatService.publishMessage(message);
  }

  handlePublishedMessages() {
    this.ChatService.receiveBroadcastsNoRepudiation().subscribe(async (message: any) => {
      console.log('Received message ', message);

      // Check signature
      let hash = await digest(message.body);

      let sig = my_rsa.verify(hexToBigint(message.signature), this.serverE, this.serverN);
      if (hexToBigint(hash) !== sig) {
        alert('Verification of Pkp failed');
        return;
      } else{
        console.log('Verification of Pkp passed', hash);
      }

      // Analyse published message to see if you are Alice or Bob and display info
      if(message.body.destination === this.username){
        // Alice
        let bob = this.getSelectedUserFromUsername(message.body.destination2);
        bob.Pkp = message.signature;
      }
      else if(message.body.destination2 == this.username) {
        // Bob
        // this.Pkp = hexToBigint(message.signature);

        //  Convert iv: string to iv: Uint8Array
        let str = message.body.k.iv;
        let buf = new ArrayBuffer(str.length); // 2 bytes for each char
        let bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        let iv = bufView;

        const key = message.body.k.k;
        const jwk = await AESCBCModule.importKey(key);
        const m = await AESCBCModule.decryptMessage(this.c, jwk, iv);
        let msg = bufToText(m);
        const dialogRef = this.dialog.open(NoRepudiationPopUpComponent, {
          width: '500px',
          data: {Po: bigintToHex(this.Po), Pkp: bigintToHex(message.signature), username: message.body.destination, message: msg}
        });
        dialogRef.afterClosed().subscribe(result=>{
          console.log('Closed pop up')
        });
      }
    })
  }
}

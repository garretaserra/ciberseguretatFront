import {Component} from '@angular/core';
import {GeneralService} from './services/general.service';
// @ts-ignore
import my_rsa from 'my_rsa';
import {bigintToHex, bigintToText, bufToText, hexToBigint, textToBigint} from 'bigint-conversion';
import {ChatService} from "./services/chat.service";
import {AESCBCModule} from "./aes-cbc/aes-cbc.module";
import {digest} from "object-sha";
import {NoRepudiationPopUpComponent} from "./no-repudiation-pop-up/no-repudiation-pop-up.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  rsa;

  // Test Server
  testInputText = '';
  testResponseText = '';

  // Blind signature
  serverPublicKey = '';
  blindSignatureRequest = '';
  blindSignatureResponse = '';
  serverE;
  serverN;
  publicEText = '';
  verifiedCheckBox = false;

  // No Repudiation
  username = '';
  userList: User[];
  selectedUser: User = {username: undefined, publicKey: undefined, id:undefined};
  noRepudiationMessage = '';
  symKey: SymmetricKey;
  c: string;
  Po: bigint;   //Proof of origin
  Pr: bigint;   //Proof of reception
  PrText: string;
  Pkp: bigint;  //Proof of k publication
  PkpText: string;
  lockLoginButton :boolean = false;

  constructor(
    private generalService: GeneralService,
    private ChatService: ChatService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.rsa = new my_rsa();
  }

  ngOnInit() {
    this.handleNewUsers();
    this.handlePrivateMessages();
    this.handlePublishedMessages();
  }

  async getButton() {
    this.testResponseText = (await this.generalService.messageGet(this.testInputText).toPromise()).message;
  }

  async postButton() {
    this.testResponseText = (await this.generalService.messagePost(this.testInputText).toPromise()).message;
  }

  async updateValueE(event) {
    if (!this.serverPublicKey) {
      alert('Please, click the "Get Public Key" button');
      return ;
    }

    this.publicEText =  bigintToHex(this.serverE);
    if (event === 'Dec') {
      this.publicEText = parseInt(this.publicEText.toString(), 16).toString();
    }
  }

  async getPublicKeyButton() {
    const response =  await this.generalService.getPublicKey().toPromise();
    this.serverPublicKey = JSON.stringify(response);
    const object = JSON.parse(this.serverPublicKey);
    this.serverN = hexToBigint(object.n);
    this.serverE = hexToBigint(object.e);
  }

  async getBlindSignature() {
    if (!this.blindSignatureRequest) {
      alert('No message');
      return ;
    }
    const message = textToBigint(this.blindSignatureRequest);

    if (!(this.serverE && this.serverN)) {
      alert('Get public key first');
      return ;
    }

    // Blind message
    const res = my_rsa.blind(message, this.serverE, this.serverN);
    const blindedMessage = bigintToHex(res.blindedMessage);

    // Get r for unblinding
    const r = res.r;

    // Make blind signature request to server
    let blindedSignature = (await this.generalService.signMessage(blindedMessage).toPromise()).signature;

    // UnBlind signature
    blindedSignature = hexToBigint(blindedSignature);
    const signature = my_rsa.unBlind(blindedSignature, r, this.serverN);
    // Get hex value of the blinded signature so it can be displayed
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
    if (!this.username){
      alert('No username specified');
      return;
    }
    this.ChatService.login(this.username, JSON.stringify({e: bigintToHex(this.rsa.publicKey.e), n: bigintToHex(this.rsa.publicKey.n)}));
    this.snackBar.open('Logged in','ok', {duration: 1000});
    this.lockLoginButton = true;
  }

  selectUser(user) {
    this.selectedUser = user;
  }

  handleNewUsers() {
    this.ChatService.getConnected().subscribe((message: string) => {
      this.userList = JSON.parse(message);
      this.userList = this.userList.filter((user) => {
        // user.publicKey = JSON.parse(user.publicKey);
        if (user.username !== this.username) {
          return user;
        }
      });
    });
  }

  async startNonRepudiableMessage() {
    if (!this.selectedUser) {
      alert('Need to select user');
      return;
    }

    if (!this.noRepudiationMessage) {
      alert('Need message to send');
      return;
    }

    // Encrypt the message
    const iv = await window.crypto.getRandomValues(new Uint8Array(16));
    const jwk = await AESCBCModule.generateKey(); // Generated key in jwk format
    let key = await crypto.subtle.exportKey('jwk', jwk); // Export generated key
    this.c = await AESCBCModule.encryptMessage(this.noRepudiationMessage, jwk, iv); // Message encrypted

    // Save Key. Key is formed by k and iv.
    this.symKey = {
      k: key.k,
      iv: String.fromCharCode.apply(null, iv) // Convert iv to String
    };

    // Get timestamp
    const timestamp = Date.now().toString();

    // Build message
    const body: NoRepudiationBody = {
      origin: this.username,
      destination: this.selectedUser.username,
      c: this.c,
      timestamp: timestamp
    };

    const hash = await digest(body);
    const Po = bigintToHex(this.rsa.sign(hexToBigint(hash)));
    console.log('Po', Po);

    const message: NoRepudiationMessage = {
      messageType: 'noRepudiation1',
      body,
      signature: Po
    };

    console.log('Message sent', message);
    this.ChatService.sendMessageToUser(message, this.selectedUser.id);
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

  async answerNonRepudiableMessage(message) {
    //Receives fist message of No repudiation from Alice and sends answers with second message to Alice
    console.log('Received message', message);

    // Check timestamp
    const localTimestamp = Date.now();
    const remoteTimestamp = parseInt(message.body.timestamp, 10);
    const maxDiffTime = 2 * 60 * 1000; // 2 minutes
    const calcDiffTime = (localTimestamp - remoteTimestamp);
    if (calcDiffTime < 0 || calcDiffTime > maxDiffTime){
      alert('Timestamp error ' + calcDiffTime + ' ms.');
      return;
    }

    // Check signature
    let hash = await digest(message.body);
    // Get public key of sender
    let key;
    this.userList.forEach((user)=>{
      if(user.username === message.body.origin)
        key = user.publicKey;
    });
    let sig = my_rsa.verify(hexToBigint(message.signature), hexToBigint(key.e), hexToBigint(key.n));
    if(hash !== bigintToHex(sig)){
      alert('Verification of Po failed');
      return ;
    }
    else {
      console.log('Verification of Po passed', hash);
      this.Po = hexToBigint(message.signature);
    }

    message.body.destination = message.body.origin;
    message.body.origin = this.username;
    // Get timestamp
    message.body.timestamp = Date.now().toString();

    // Save Cipher locally and remove it from message
    this.c = message.body.c;

    // Get Proof of Reception: Pr
    hash = await digest(message.body);
    message.signature = bigintToHex(this.rsa.sign(hexToBigint(hash)));

    delete message.body.c;

    message.messageType = 'noRepudiation2';

    // Find destination user
    this.userList.some((user) => {
      if (user.username === message.body.destination) {
        this.ChatService.sendMessageToUser(message, user.id);
        console.log('Message sent', message);
        return true;
      }
    });
  }

  async publishNoRepudiationMessage(message) {
    // Receives answer from Bob (2nd message of no repudiation) and sends message to publish to TTP (3rd message of no repudiation)
    console.log('Received message', message);

    message.body.c = this.c;

    // TODO: Check signature
    // Check signature
    let hash = await digest(message.body);
    // Get public key of sender
    let key;
    this.userList.forEach((user) => {
      if (user.username === message.body.origin)
        key = user.publicKey;
    });
    let sig = my_rsa.verify(hexToBigint(message.signature), hexToBigint(key.e), hexToBigint(key.n));
    console.log(hash, bigintToHex(sig), key);
    if (hash !== bigintToHex(sig)) {
      alert('Verification of Pr failed');
      return;
    } else{
      console.log('Verification of Pr passed', hash);
      this.PrText = message.signature;
    }

    // Refactor message
    message.messageType = 'noRepudiation3';
    message.body.destination = 'TTP';
    message.body.destination2 = message.body.origin;
    message.body.origin = this.username;
    message.body.k = this.symKey;
    message.body.timestamp = Date.now().toString();

    // TODO: Sign message body
    // Get Proof of Reception of K: Pko
    hash = await digest(message.body);
    message.signature = bigintToHex(this.rsa.sign(hexToBigint(hash)));

    console.log('Message sent', message);
    this.ChatService.publishMessage(message);
  }

  handlePublishedMessages() {
    this.ChatService.receiveBroadcastsNoRepudiation().subscribe(async (message: any) => {
      console.log('Received message ', message);

      // Get servers public key
      await this.getPublicKeyButton();

      // Check signature
      let hash = await digest(message.body);

      let sig = my_rsa.verify(hexToBigint(message.signature), this.serverE, this.serverN);
      if (hash !== bigintToHex(sig)) {
        alert('Verification of Pkp failed');
        return;
      } else{
        console.log('Verification of Pkp passed', hash);
      }


      // Analyse published message to see if you are Alice or Bob and display info
      if(message.body.destination === this.username){
        // Alice
        this.Pkp = hexToBigint(message.signature);
        this.PkpText = message.signature;
      }
      else if(message.body.destination2 == this.username) {
        // Bob
        this.Pkp = hexToBigint(message.signature);

        //  Convert iv: string to iv: Uint8Array
        let str = message.body.k.iv;
        var buf = new ArrayBuffer(str.length); // 2 bytes for each char
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }

        let iv = bufView;
        let key = message.body.k.k;
        let jwk = await AESCBCModule.importKey(key);

        const m = await AESCBCModule.decryptMessage(this.c, jwk, iv);
        let msg = bufToText(m);

        const dialogRef = this.dialog.open(NoRepudiationPopUpComponent, {
          width: '500px',
          data: {Po: bigintToHex(this.Po), Pkp: bigintToHex(this.Pkp), username: message.body.destination, message: msg}
        });
        dialogRef.afterClosed().subscribe(result=>{
          console.log('Closed pop up')
        });
      }
    })
  }
}

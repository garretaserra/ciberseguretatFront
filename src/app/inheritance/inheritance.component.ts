import { Component, OnInit } from '@angular/core';
import {User} from "../models/User";
import {SymmetricKey} from "../models/SymmetricKey";
import {bigintToHex} from "bigint-conversion";
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
  symKey: SymmetricKey;
  c: bigint;
  t: number;
  lockLoginButton :boolean = false;

  modulus: BigNumber;

  ngOnInit() {
    this.handleNewUsers();

    //Generate a new random Modulus
    this.modulus = new BigNumber(cryptoUtils.primeSync(16, 5).toString());
    console.log('MODULUS', this.modulus);
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

  start() {
    // Generate secret parts
    let points: IPoint<string>[] = this.shamirsSecretSharing.getPoints(this.selectedUsers.length, this.t, this.modulus);

    //Assign secrets to selected users
    this.selectedUsers.forEach((selectedUser, index)=>{
      selectedUser.c = points[index].x.toString() + ',' + points[index].y.toString();
    })

    //Start no repudiation with each selected user
  }
}

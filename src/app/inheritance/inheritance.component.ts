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
  ) {
    this.rsa = new my_rsa();
  }

  ngOnInit(): void {
  }

  rsa;
  username = '';
  userList: User[];
  selectedUser: User = {username: undefined, publicKey: undefined, id:undefined};
  noRepudiationMessage = '';
  symKey: SymmetricKey;
  c: bigint;
  Po: bigint;   //Proof of origin
  Pr: bigint;   //Proof of reception
  PrText: string;
  Pkp: bigint;  //Proof of k publication
  PkpText: string;
  lockLoginButton :boolean = false;

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
}

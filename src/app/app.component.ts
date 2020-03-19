import { Component } from '@angular/core';
import {MessageService} from './services/message.service';
// @ts-ignore
import my_rsa from "my_rsa";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  inputText = "";
  responseText = "";
  constructor(
    private messageService: MessageService
  ) {
    let s = new my_rsa();
    console.log(s.encrypt(my_rsa.encodeString('hola')))
  }

  async getButton(){
    this.responseText = (await this.messageService.messageGet(this.inputText).toPromise()).message
  }

  async postButton() {
    this.responseText = (await this.messageService.messagePost(this.inputText).toPromise()).message
  }
}

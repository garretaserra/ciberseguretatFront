import { Component } from '@angular/core';
import {MessageService} from './services/message.service'

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
  }

  async getButton(){
    this.responseText = (await this.messageService.messageGet(this.inputText).toPromise()).message
  }

  async postButton() {
    this.responseText = (await this.messageService.messagePost(this.inputText).toPromise()).message
  }
}

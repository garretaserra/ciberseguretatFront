import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private url = 'http://localhost:3000';
  private socket: Socket;

  constructor() {
    this.socket = io(this.url);
  }

  login(){
    this.socket.emit('login', 'this is a username')
  }

  getConnectedList(){
    this.socket.emit('getConnected')
  }

  public getMessages = () => {
    return new Observable((observer) => {
      this.socket.on('', (message) => {
        observer.next(message);
      });
    });
  }
}

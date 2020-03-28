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

  login(userName, publicKey){
    this.socket.emit('login', userName, publicKey);
  }

  public getConnected = () => {
    return new Observable((observer) => {
      this.socket.on('userList', (message) => {
        observer.next(message);
      });
    });
  };

  sendMessageToUser(message, destination){
    this.socket.emit('proxy', destination, message)
  }

  public privateMessages = () =>{
    return new Observable((observer)=>{
      this.socket.on('proxy', (message)=>{
        observer.next(message);
      });
    });
  };

  publishMessage(message){
    this.socket.emit('publishNoRepudiation', message);
  }

  public receiveBroadcastsNoRepudiation = () => {
    return new Observable((observer)=>{
      this.socket.on('publish', (message) => {
        observer.next(message);
      })
    })
  }
}

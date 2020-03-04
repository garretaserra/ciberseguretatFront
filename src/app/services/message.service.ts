import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "./environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(public http: HttpClient) { }
  url = environment.uri;

  messagePost(message: String) : Observable<string>{
    return this.http.post<string>(this.url + '/message', {message: message}, {responseType: "text"});
  }

  messageGet(message: String) : Observable<string>{
    return this.http.get<string>(this.url + '/message?message=' + message, {responseType: "text"});
  }
}

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

  messagePost(message: String) : Observable<any>{
    return this.http.post<any>(this.url, {message: message});
  }

  messageGet(message: String) : Observable<any>{
    return this.http.get<any>(this.url + '?message=' + message);
  }
}

import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from './environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  constructor(public http: HttpClient) { }
  url = environment.uri;

  messagePost(message: string): Observable<any> {
    return this.http.post<any>(this.url, {message});
  }

  messageGet(message: string): Observable<any> {
    return this.http.get<any>(this.url + '?message=' + message);
  }

  getPublicKey(): Observable<string> {
    return this.http.get<string>(this.url + '/pubKey');
  }
}

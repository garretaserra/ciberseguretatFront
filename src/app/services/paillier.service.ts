import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from './environment';
import {PublicKey} from "paillier-bigint";

@Injectable({
  providedIn: 'root'
})
export class PaillierService {

  constructor(
    public httpClient: HttpClient
  ) { }
  url = environment.uri;

  private aggregatorUrl = 'http://localhost:3001/';

  public getKey(){
    return this.httpClient.get<any>(this.url + '/calculator/getKey');
  }

  public sum(m1: string, m2:string, n:string){
    return this.httpClient.post<any>(this.aggregatorUrl+'sum', {m1, m2, n})
  }
}

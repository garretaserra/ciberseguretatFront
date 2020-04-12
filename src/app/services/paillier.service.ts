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

  public sum (numbers: string[]){
    return this.httpClient.post<any>(this.aggregatorUrl+'sum', {numbers})
  }

  public multiply(m1: string, m2:string){
    return this.httpClient.post<any>(this.aggregatorUrl+'multiply', {m1, m2})
  }

}

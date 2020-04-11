import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PaillierService {

  constructor(
    public httpClient: HttpClient
  ) { }

  private url = 'localhost:3001/';

  public sum(m1: string, m2:string, n:string){
    return this.httpClient.post(this.url+'sum', {m1, m2, n})
  }
}

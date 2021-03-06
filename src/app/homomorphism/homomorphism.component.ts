import { Component, OnInit } from '@angular/core';
import {AppComponent} from "../app.component";
import {GeneralService} from "../services/general.service";
import {PaillierService} from '../services/paillier.service';
import {bigintToHex, hexToBigint} from "bigint-conversion";
import {PublicKey} from "paillier-bigint";
@Component({
  selector: 'app-homomorphism',
  templateUrl: './homomorphism.component.html',
  styleUrls: ['./homomorphism.component.css']
})
export class HomomorphismComponent implements OnInit {

  Number: string[] = ['', '']
  result = "";
  publicKey;


  constructor(
    private paillierService: PaillierService
  ) {

  }

  async ngOnInit() {
    let response = await this.paillierService.getKey().toPromise();
    this.publicKey = new PublicKey(hexToBigint(response.n), hexToBigint(response.g));
  }


  async Sum() {
    let sortir: boolean = false;
    this.Number.forEach((num)=>{
      if(isNaN(Number(num))){
        sortir= true;
      }
    })
    if(sortir){
      alert('Posa numeros')
      return ;
    }

    let num: string[] = [];

    this.Number.forEach((item)=>{
      num.push(bigintToHex(this.publicKey.encrypt(BigInt(item))));
    })

    let res = await this.paillierService.sum(num).toPromise();
    this.result = hexToBigint(res.result).toLocaleString();
  }

  async Multiply(){
    let n1 = BigInt(this.Number[0]);
    let m2 = 1n;
    let m1 = this.publicKey.encrypt(n1);

    let sortir: boolean = false;
    this.Number.forEach((num, index)=> {
      if (isNaN(Number(num))) {
        sortir = true;
      }
      if(index != 0){
        m2 = m2 * BigInt(this.Number[index]);
      }
    })

    let res = await this.paillierService.multiply(bigintToHex(m1), bigintToHex(m2)).toPromise();
    this.result = hexToBigint(res.result).toLocaleString();
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  AddNumber() {
    this.Number.push('');
  }

  DeleteNumber(i) {
    this.Number.splice(i,1);
  }
}

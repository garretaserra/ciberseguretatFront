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

  Number1 = "";
  Number2 = "";
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
    let n1 = BigInt(this.Number1);
    let n2 = BigInt(this.Number2);

    let m1 = this.publicKey.encrypt(n1);
    let m2 = this.publicKey.encrypt(n2);

    let res = await this.paillierService.sum(bigintToHex(m1), bigintToHex(m2), bigintToHex(this.publicKey.n)).toPromise();
    this.result = hexToBigint(res.result).toLocaleString();
  }
}

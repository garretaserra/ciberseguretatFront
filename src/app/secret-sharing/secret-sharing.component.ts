import { Component, OnInit } from '@angular/core';
import { ShamirsSecretService } from '../services/shamirs-secret.service';
import { IPoint } from '../models/ipoint';
import BigNumber from 'bignumber.js';


@Component({
  selector: 'app-secret-sharing',
  templateUrl: './secret-sharing.component.html',
  styleUrls: ['./secret-sharing.component.css']
})
export class SecretSharingComponent implements OnInit {
   displayPoints: IPoint<string>[];
   points:IPoint<BigNumber>[];
   modulus: string;
   t: string;
   n: string;
   point: string;

  constructor(private shamirs: ShamirsSecretService) { 
    this.points = [];
  }

  ngOnInit() {
  }

  // setModulus = () => this.modulus = this.shamirs.getModulus();
  // secretSharing = () => this.displayPoints = this.shamirs.shamirsSecrets(Number(this.t), Number(this.n));

  // lagrangeInterpolation = () => {
  //   this.setModulus();
  //   const _t: bigint = BigInt(this.points.length);
  //   this.shamirs.lagrangeInterpolation(_t, 0n, BigInt(this.modulus) ,this.points);
  // }

  // setPoint = () => {
  //   const split: string[] = this.point.split(',');
  //   console.log(split[0]);
  //   console.log(split[1]);
    
  //   const _point: IPoint<BigNumber> = { x: new BigNumber(split[0]), y: new BigNumber(split[1]) };
  //   this.points.push(_point);
  // }
}

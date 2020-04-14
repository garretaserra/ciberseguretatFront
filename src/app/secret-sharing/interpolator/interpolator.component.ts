import { Component, OnInit } from '@angular/core';
import { IPoint } from 'src/app/models/ipoint';
import BigNumber from 'bignumber.js';
import { ShamirsSecretService } from 'src/app/services/shamirs-secret.service';

@Component({
  selector: 'app-interpolator',
  templateUrl: './interpolator.component.html',
  styleUrls: ['./interpolator.component.css']
})
export class InterpolatorComponent implements OnInit {
  points:IPoint<BigNumber>[] = [];
  point: string = '';
  modulus: string = '';
  secret: string;

  constructor(
    private shamirs: ShamirsSecretService
  ) {  }

  ngOnInit() {
  }

  setPoint = () => {
    const split: string[] = this.point.split(',');
    const _point: IPoint<BigNumber> = { x: new BigNumber(split[0]), y: new BigNumber(split[1]) };
    this.points.push(_point);
    this.point = '';
  }

  interpolation = () => {
    const _modulus: bigint = BigInt(this.modulus);
    const _t: bigint = BigInt(this.points.length);
    this.secret = this.shamirs.lagrangeInterpolation(_t, 0n, _modulus, this.points).toString();
  }
}

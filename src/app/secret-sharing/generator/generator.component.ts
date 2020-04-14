import { Component, OnInit } from '@angular/core';
import { IPoint } from 'src/app/models/ipoint';
import { ShamirsSecretService } from 'src/app/services/shamirs-secret.service';
import * as cryptoUtils from 'bigint-crypto-utils';
import BigNumber from 'bignumber.js';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {
  points: IPoint<string>[];
  t: string;
  n: string;

  constructor(
    private shamirs: ShamirsSecretService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
  }

  getPoints = () => {
    // Generate random modulus
    const _modulus = cryptoUtils.primeSync(16, 5).toString();
    console.log('MODULUS', _modulus);
    const mod = new BigNumber(_modulus);

    const _t: number = Number(this.t);
    const _n: number = Number(this.n);
    this.points = this.shamirs.getPoints(_n, _t, mod);
  }

  copy = (point: IPoint<string>) => {
    const val: string = `${point.x},${point.y}`;
    const selBox = document.createElement('textarea');
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._snackBar.open('Values Copied', '', {
      duration: 1000,
    });
    }
}

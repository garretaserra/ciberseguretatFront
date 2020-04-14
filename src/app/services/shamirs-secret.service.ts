import {Injectable} from '@angular/core';
import * as cryptoUtils from 'bigint-crypto-utils';
import BigNumber from 'bignumber.js';
import {IPoint} from '../models/ipoint';

// import { compileBaseDefFromMetadata } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ShamirsSecretService {

  constructor( ) {
  }

  /*
  * Generates t random coefficients
  */
  private setCoefficients = (t: number, modulus: BigNumber) => {
    let coefficients: BigNumber[] = [];
    while(coefficients.length < t){
      coefficients.push(this.randomBigNum(modulus));
    }
    console.log('Coefficients', coefficients.toString());
    return coefficients;
  }

  public getPoints = (n: number, t: number, modulus: BigNumber): IPoint<string>[] => {
    let points: IPoint<string>[] = [];
    const coefficients: BigNumber[] = this.setCoefficients(t, modulus);
    const _n = BigInt(n);

    for (let i: number = 0; i < _n; i++) {
      let x = new BigNumber(i);
      let y = new BigNumber(0);

      coefficients.forEach((coef, exponent) => {
        let p = x.pow(exponent, modulus);
        let m = coef.multipliedBy(p);
        y = y.plus(m).mod(modulus);
      });
      points.push({ x: x.toString(), y: y.toString()});
    }
    return points;
  }

  public lagrangeInterpolation = (t: bigint, k: bigint, modulus: bigint, points: IPoint<BigNumber>[]) => {
    let numerator: BigNumber;
    let denomminator: BigNumber;
    let fraction: BigNumber;
    let term: BigNumber;
    const _k: BigNumber = new BigNumber(k.toString());
    const _modulus: BigNumber = new BigNumber(modulus.toString());
    let secret: BigNumber = new BigNumber(0);

    for (let i: number = 0; i < t; i++) {
      term = points[i].y;
      for (let j: number = 0; j < t; j++) {
        if (j!=i) {
          numerator = _k.minus(points[j].x);
          denomminator = points[i].x.minus(points[j].x);
          fraction = numerator.dividedBy(denomminator);
          term = term.multipliedBy(fraction);
        }
      }
      secret = secret.plus(term);
    }
    return secret.toFixed(0);
  }

  // Returns an integer BigNumber between 0 and mod
  public randomBigNum(mod: BigNumber): BigNumber{
    let numLength = mod.toString().length + 1;
    return BigNumber.random(numLength).multipliedBy(10**numLength).mod(mod);
  }
}

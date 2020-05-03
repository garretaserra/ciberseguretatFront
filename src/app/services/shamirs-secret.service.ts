import {Injectable} from '@angular/core';
import BigNumber from 'bignumber.js';
import {IPoint} from '../models/ipoint';

// import { compileBaseDefFromMetadata } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ShamirsSecretService {

  constructor( ) {
  }

  public getPoints = (n: number, t: number, modulus: BigNumber, secret: string): IPoint<string>[] => {
    let points: IPoint<string>[] = [];

    // Generate random coefficients
    const coefficients: BigNumber[] = [(new BigNumber(secret))]; // First coefficient will be the secret
    while(coefficients.length < t){
      coefficients.push(this.randomBigNum(modulus));
    }
    const _n = BigInt(n);

    for (let i: number = 0; i < _n; i++) {
      let x = new BigNumber(i+1);
      let y = new BigNumber(0);

      coefficients.forEach((coef, exponent) => {
        let p = x.pow(exponent, modulus);
        let m = coef.multipliedBy(p);
        y = y.plus(m).mod(modulus);
        // console.log('coef', coef.toString(), '\nexp', exponent.toString(), '\nx', x.toString(), '\np', p.toString(), '\nm', m.toString(), '\ny', y.toString())
      });
      points.push({ x: x.toString(), y: y.toString()});
    }
    return points;
  }

  public lagrangeInterpolation = (t: bigint, k: bigint, modulus: BigNumber, points: IPoint<BigNumber>[]) => {
    let numerator: BigNumber;
    let denominator: BigNumber;
    let fraction: BigNumber;
    let term: BigNumber;
    const _k: BigNumber = new BigNumber(k.toString());
    let secret: BigNumber = new BigNumber(0);

    for (let i: number = 0; i < t; i++) {
      term = points[i].y;
      for (let j: number = 0; j < t; j++) {
        if (j!=i) {
          numerator = _k.minus(points[j].x);
          denominator = points[i].x.minus(points[j].x);
          fraction = numerator.dividedBy(denominator);
          term = term.multipliedBy(fraction);
        }
      }
      secret = secret.plus(term);
    }
    if(modulus.isInteger())
      secret = secret.mod(modulus)
    return secret.toFixed(0);
  }

  // Returns an integer BigNumber between 0 and mod
  public randomBigNum(mod: BigNumber): BigNumber{
    let numLength = mod.toString().length + 1;
    return BigNumber.random(numLength).multipliedBy(10**numLength).mod(mod);
  }
}

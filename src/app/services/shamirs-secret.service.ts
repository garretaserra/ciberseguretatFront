import { Injectable } from '@angular/core';
import * as cryptoUtils from 'bigint-crypto-utils'
import { NumberSymbol } from '@angular/common';
import { bigintToHex } from 'bigint-conversion';

@Injectable({
  providedIn: 'root'
})
export class ShamirsSecretService {
  private MODULUS: bigint;
  
  constructor( ) { }
  
  public shamirsSecrets = (t: number, n: number) => {
    const _n = BigInt(n);
    const _t = BigInt(t);
    this.MODULUS = 10n;
    // this.MODULUS = cryptoUtils.primeSync(32, 5);
    this.lagrangeInterpolation(_t, 0n, this.evaluateFunction(_n, this.setCoefficients(t)));
  }
  
  private setCoefficients = (t: number) => {
    let coefficients: bigint[] = [];
    for (let i: number = 0; i < t; i++) coefficients.push(this.randomBigint());
    console.log(`Coefficients -> ${coefficients}`);
    return coefficients;
  }
  
  private evaluateFunction = (n: bigint, coefficients: bigint[]) => {
    let points: IPoint[] = [];
    // let pointd: IPointDict = {};
    let x: bigint;
    let y: bigint;
    
    for (let i: number = 0; i < n; i++) {
      x = this.randomBigint();
      y = 0n;
      coefficients.forEach((coef, r) => { y = (y + (coef*(x**BigInt(r))))});     
      points.push({ x: x, y: y});
      // pointd[i] = { x, y }
    }
    console.log('POINTS', points);
    return points;
  }
  
  public lagrangeInterpolation = (t: bigint, k: bigint, points: IPoint[]) => {

    let secret: bigint = 0n;
    for (let i: number = 0; i < t; i++) {
      let term: bigint = points[i].y;
      for (let j: number = 0; j < t; j++) {
        if (j!=i) {
          term = (term * (k-points[j].x) / (points[i].x - points[j].x ));
        }
      }
      secret = (secret + term) ;
    }
    console.log(`SECRET ${secret}`);
    return secret;
  }

  private randomBigint = (): bigint => 
    cryptoUtils.randBetween(99n, 0n);
    // return BigInt(Math.round((Math.random() * 1e3)));
  
  
}
interface IPoint {
  x: bigint;
  y: bigint;
}
// Index signature
// interface IPointDict {
//   [key: number]: IPoint;
// }
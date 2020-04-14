import { Injectable } from '@angular/core';
import * as cryptoUtils from 'bigint-crypto-utils'
import BigNumber from 'bignumber.js';
import {IPoint} from '../models/ipoint';
import { compileBaseDefFromMetadata } from '@angular/compiler';
import { IpcNetConnectOpts } from 'net';

@Injectable({
  providedIn: 'root'
})
export class ShamirsSecretService {
  
  constructor( ) { 
  }
  
  private setCoefficients = (t: number) => {
    let coefficients: BigNumber[] = [];
    for (let i: number = 0; i < t; i++) coefficients.push(this.randomBignum());
    console.log('Coefficients');
    coefficients.forEach((coef, i) => console.log(`a${i} = ${coef}`));
    return coefficients;
  }
  
  public getPoints = (n: number, t: number, modulus: BigNumber): IPoint<string>[] => {
    let points: IPoint<string>[] = [];
    const coefficients: BigNumber[] = this.setCoefficients(t);
    const _n = BigInt(n); 
    let x: BigNumber;
    let y: BigNumber;
    let p: BigNumber;
    let m: BigNumber;  

    for (let i: number = 0; i < _n; i++) {
      x = this.randomBignum();
      y = new BigNumber(0);
      
      coefficients.forEach((coef, r) => {
        let rBigNum: BigNumber = new BigNumber(r);
        p = x.pow(rBigNum);
        m = coef.multipliedBy(p);
        y = y.plus(m);
      });     
      points.push({ x: x.toString(), y: y.toString()});
    }
    return points;
  }
  
  public getModulus = (): BigNumber => {
    const _modulus = cryptoUtils.primeSync(8, 5).toString();
    console.log('MODULUS', _modulus);
    const modulus: BigNumber = new BigNumber(_modulus);
    return modulus;
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
  
  private randomBignum = (): BigNumber => 
  {
    const maxBigInt: bigint = 999999n;
    const randomizedValues: BigNumber[] = [];
    let randomInt: BigNumber;
    let randomize: boolean = true;
    randomInt = new BigNumber(cryptoUtils.randBetween(maxBigInt, 0n).toString());

    while (randomize) {
      randomInt = new BigNumber(cryptoUtils.randBetween(maxBigInt, 0n).toString());
      console.log(randomInt);
      if (!!randomizedValues.length) {
        for (let val of randomizedValues) {
          if (val.isEqualTo(randomInt)) break;
          else { randomize = false; }
        }
      }
      else { randomize = false; }
    }
    return randomInt;
  }
}
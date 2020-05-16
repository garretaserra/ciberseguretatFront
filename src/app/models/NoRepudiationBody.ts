import {SymmetricKey} from "./SymmetricKey";
import { BigNumber } from 'bignumber.js';

export class NoRepudiationBody{
  origin: string;
  destination: string;
  timestamp: string;
  c?: string;
  k?: SymmetricKey;
  modulus?: string;
  threshold?: number;
  destination2?: string;
}

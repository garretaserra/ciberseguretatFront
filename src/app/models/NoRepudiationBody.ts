import {SymmetricKey} from "./SymmetricKey";

export class NoRepudiationBody{
  origin: string;
  destination: string;
  timestamp: string;
  c?: string;
  k?: SymmetricKey;
  destination2?: string;
}

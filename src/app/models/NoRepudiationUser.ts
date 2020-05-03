import{User} from "./User";

export class NoRepudiationUser {
  user: User;
  c?: string;
  Po?: string;  //Proof of origin
  Pr?: string;  //Proof of reception
  Pkp?: string; //Proof of k publication
}

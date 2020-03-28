class NoRepudiationMessage{
  messageType: "noRepudiation1" | "noRepudiation2" | "noRepudiation3" | "noRepudiation4";
  body: NoRepudiationBody;
  signature: string;
}

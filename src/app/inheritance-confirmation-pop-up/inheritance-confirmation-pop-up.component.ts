import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

export interface DialogData {
  username: string,
  Po: string,
}

@Component({
  selector: 'app-inheritance-confirmation-pop-up',
  templateUrl: './inheritance-confirmation-pop-up.component.html',
  styleUrls: ['./inheritance-confirmation-pop-up.component.css']
})
export class InheritanceConfirmationPopUpComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InheritanceConfirmationPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {  }

  ngOnInit(): void {
  }

  buttonClick(choice: string){
    this.dialogRef.close(choice)
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

export interface DialogData {
  Pkp: string,
  Po: string
}

@Component({
  selector: 'app-no-repudiation-pop-up',
  templateUrl: './no-repudiation-pop-up.component.html',
  styleUrls: ['./no-repudiation-pop-up.component.css']
})

export class NoRepudiationPopUpComponent implements OnInit {

  // Pko: string;
  // Po: string;

  constructor(
    public dialogRef: MatDialogRef<NoRepudiationPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

  }

  ngOnInit() {
  }

}

import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { ContentObserver } from '@angular/cdk/observers';

export interface DialogData {
  Pkp: string,
  Po: string,
  username: string,
  message: string,
  modulus: string,
  threshold: string
}

@Component({
  selector: 'app-no-repudiation-pop-up',
  templateUrl: './no-repudiation-pop-up.component.html',
  styleUrls: ['./no-repudiation-pop-up.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoRepudiationPopUpComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NoRepudiationPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {  }

  ngOnInit() {
  }

  close() {
    console.log(this.data);
    this.dialogRef.close();
  }
}

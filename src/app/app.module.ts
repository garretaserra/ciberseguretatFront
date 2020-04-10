import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatInputModule} from "@angular/material/input";
import {MatToolbarModule} from "@angular/material/toolbar";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {HttpClientModule} from "@angular/common/http";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCheckboxModule} from '@angular/material';
import {ChatService} from './services/chat.service';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import { NoRepudiationPopUpComponent } from './no-repudiation-pop-up/no-repudiation-pop-up.component';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import { HomomorphismComponent } from './homomorphism/homomorphism.component';

@NgModule({
  declarations: [
    AppComponent,
    NoRepudiationPopUpComponent,
    HomomorphismComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatToolbarModule,
    FormsModule,
    MatButtonModule,
    HttpClientModule,
    MatGridListModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    ChatService,
    MatSnackBar
  ],
  bootstrap: [AppComponent],
  entryComponents:[
    NoRepudiationPopUpComponent,
  ]
})
export class AppModule { }

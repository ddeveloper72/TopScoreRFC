import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app.routes';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AppRoutingModule,
    RouterModule,
  ],
  providers: [],
})
export class AppModule {}

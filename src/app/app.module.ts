import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { RouterModule } from '@angular/router';

// Comment out Firebase for now to avoid configuration issues
// import { AngularFireModule } from '@angular/fire/compat';
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
// import { environment } from '../environments/environment';

@NgModule({
  declarations: [],
  imports: [
    AppComponent,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    // Commented out Firebase until configuration is needed
    // AngularFireModule.initializeApp(environment.firebase),
    // AngularFirestoreModule,
  ],
  exports: [],
  providers: [],
})
export class AppModule {}

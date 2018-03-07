import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import * as Material from '@angular/material';
import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Material.MatMenuModule,
    Material.MatSidenavModule,
    Material.MatToolbarModule,
    Material.MatIconModule
  ],
  providers: [
    MediaMatcher,
    BreakpointObserver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

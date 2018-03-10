import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import * as Material from '@angular/material';
import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';

import { AppComponent } from './app.component';
import { AudioComponent } from './audio/audio.component';
import { TimePipe } from './time.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AudioComponent,
    TimePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Material.MatProgressBarModule,
    Material.MatTabsModule,
    Material.MatFormFieldModule,
    Material.MatInputModule,
    Material.MatSliderModule,
    Material.MatListModule,
    Material.MatTooltipModule,
    Material.MatCheckboxModule,
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

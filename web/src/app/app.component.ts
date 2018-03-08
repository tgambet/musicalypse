import {Component, OnInit, ViewChild} from '@angular/core';
import * as Material from '@angular/material';
// import {BreakpointObserver} from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('sidenav')
  sidenav: Material.MatSidenav;

  artists: string[] = [
    'Orelsan',
    'IAM',
    'Metallica'
  ];

  // isSmallScreen: boolean;

  constructor(
    // private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
/*    this.breakpointObserver.observe('(max-width: 960px)').subscribe(result => {
      if (result.matches) {
        this.isSmallScreen = true;
        this.sidenav.close();
      } else {
        this.isSmallScreen = false;
        this.sidenav.open();
      }
    });*/
  }

}

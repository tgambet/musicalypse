import {Component, OnInit} from '@angular/core';
import {LibraryService} from '../services/library.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  contentClass = 't0';

  constructor(
    public library: LibraryService,
    // private location: Location,
    // private router: Router
  ) {

  }

  translateContent(n: number) {
    this.contentClass = 't' + n;
  }

  ngOnInit() {
    // this.location.subscribe(
    //   next => {
    //     console.log(next);
    //
    //   }
    // )
  }

}

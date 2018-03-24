import {Component, OnInit} from '@angular/core';
import {LibraryService} from '../services/library.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  contentClass = 't0';

  constructor(
    public library: LibraryService,
    public route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((next: ParamMap) => {
      if (next.has('t')) {
        this.contentClass = 't' + next.get('t');
      } else {
        this.contentClass = 't0';
      }
    });

  }

  translateContent(n: number) {
    this.contentClass = 't' + n;
    this.router.navigate(['/library', { t: n }]);
  }

}

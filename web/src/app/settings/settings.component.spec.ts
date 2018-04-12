import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import * as Material from '@angular/material';
import {SettingsComponent} from './settings.component';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [
        HttpClientModule,
        RouterModule,
        Material.MatChipsModule,
        Material.MatRadioModule,
        Material.MatSlideToggleModule,
        Material.MatGridListModule,
        Material.MatDialogModule,
        Material.MatSnackBarModule,
        Material.MatButtonModule,
        Material.MatProgressSpinnerModule,
        Material.MatProgressBarModule,
        Material.MatTabsModule,
        Material.MatFormFieldModule,
        Material.MatSelectModule,
        Material.MatInputModule,
        Material.MatSliderModule,
        Material.MatListModule,
        Material.MatTooltipModule,
        Material.MatCheckboxModule,
        Material.MatMenuModule,
        Material.MatSidenavModule,
        Material.MatToolbarModule,
        Material.MatIconModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

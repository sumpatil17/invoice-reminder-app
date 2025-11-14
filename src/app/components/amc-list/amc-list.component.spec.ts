import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmcListComponent } from './amc-list.component';

describe('AmcListComponent', () => {
  let component: AmcListComponent;
  let fixture: ComponentFixture<AmcListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AmcListComponent]
    });
    fixture = TestBed.createComponent(AmcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

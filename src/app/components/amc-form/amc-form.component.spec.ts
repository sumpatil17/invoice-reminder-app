import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmcFormComponent } from './amc-form.component';

describe('AmcFormComponent', () => {
  let component: AmcFormComponent;
  let fixture: ComponentFixture<AmcFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AmcFormComponent]
    });
    fixture = TestBed.createComponent(AmcFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

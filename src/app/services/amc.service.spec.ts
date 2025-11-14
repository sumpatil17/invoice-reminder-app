import { TestBed } from '@angular/core/testing';

import { AMCService } from './amc.service';

describe('AmcService', () => {
  let service: AMCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AMCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

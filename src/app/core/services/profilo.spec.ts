import { TestBed } from '@angular/core/testing';

import { Profilo } from './profilo';

describe('Profilo', () => {
  let service: Profilo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Profilo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

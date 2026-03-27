import { TestBed } from '@angular/core/testing';

import { Autore } from './autore';

describe('Autore', () => {
  let service: Autore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Autore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

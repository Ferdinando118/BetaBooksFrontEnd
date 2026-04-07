import { TestBed } from '@angular/core/testing';

import { Recensione } from './recensione';

describe('Recensione', () => {
  let service: Recensione;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recensione);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

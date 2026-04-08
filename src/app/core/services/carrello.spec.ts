import { TestBed } from '@angular/core/testing';

import { Carrello } from './carrello';

describe('Carrello', () => {
  let service: Carrello;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Carrello);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

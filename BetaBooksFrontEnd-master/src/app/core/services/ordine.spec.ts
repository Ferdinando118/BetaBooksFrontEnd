import { TestBed } from '@angular/core/testing';

import { Ordine } from './ordine';

describe('Ordine', () => {
  let service: Ordine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ordine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

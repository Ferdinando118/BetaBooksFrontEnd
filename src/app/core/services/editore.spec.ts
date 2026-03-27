import { TestBed } from '@angular/core/testing';

import { EditoreService } from './editore';

describe('Editore', () => {
  let service: EditoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

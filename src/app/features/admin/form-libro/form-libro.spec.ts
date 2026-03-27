import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLibro } from './form-libro';

describe('FormLibro', () => {
  let component: FormLibro;
  let fixture: ComponentFixture<FormLibro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLibro],
    }).compileComponents();

    fixture = TestBed.createComponent(FormLibro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spedizioni } from './spedizioni';

describe('Spedizioni', () => {
  let component: Spedizioni;
  let fixture: ComponentFixture<Spedizioni>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spedizioni],
    }).compileComponents();

    fixture = TestBed.createComponent(Spedizioni);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

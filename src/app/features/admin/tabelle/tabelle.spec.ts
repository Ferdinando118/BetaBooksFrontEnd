import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tabelle } from './tabelle';

describe('Tabelle', () => {
  let component: Tabelle;
  let fixture: ComponentFixture<Tabelle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabelle],
    }).compileComponents();

    fixture = TestBed.createComponent(Tabelle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

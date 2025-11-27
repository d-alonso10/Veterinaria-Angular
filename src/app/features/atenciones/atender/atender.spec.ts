import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Atender } from './atender';

describe('Atender', () => {
  let component: Atender;
  let fixture: ComponentFixture<Atender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Atender]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Atender);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

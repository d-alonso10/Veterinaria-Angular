import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAtencion } from './crear-atencion';

describe('CrearAtencion', () => {
  let component: CrearAtencion;
  let fixture: ComponentFixture<CrearAtencion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAtencion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearAtencion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

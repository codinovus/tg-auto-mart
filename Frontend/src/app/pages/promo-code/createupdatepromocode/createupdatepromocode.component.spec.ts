import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatepromocodeComponent } from './createupdatepromocode.component';

describe('CreateupdatepromocodeComponent', () => {
  let component: CreateupdatepromocodeComponent;
  let fixture: ComponentFixture<CreateupdatepromocodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatepromocodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatepromocodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

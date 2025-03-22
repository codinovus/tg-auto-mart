import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdateorderComponent } from './createupdateorder.component';

describe('CreateupdateorderComponent', () => {
  let component: CreateupdateorderComponent;
  let fixture: ComponentFixture<CreateupdateorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdateorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdateorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

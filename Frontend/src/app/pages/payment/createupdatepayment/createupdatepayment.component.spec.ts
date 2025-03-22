import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatepaymentComponent } from './createupdatepayment.component';

describe('CreateupdatepaymentComponent', () => {
  let component: CreateupdatepaymentComponent;
  let fixture: ComponentFixture<CreateupdatepaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatepaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

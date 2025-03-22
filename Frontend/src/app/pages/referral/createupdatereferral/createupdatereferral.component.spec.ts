import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatereferralComponent } from './createupdatereferral.component';

describe('CreateupdatereferralComponent', () => {
  let component: CreateupdatereferralComponent;
  let fixture: ComponentFixture<CreateupdatereferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatereferralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatereferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

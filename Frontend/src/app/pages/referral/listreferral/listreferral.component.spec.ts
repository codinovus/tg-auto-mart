import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListreferralComponent } from './listreferral.component';

describe('ListreferralComponent', () => {
  let component: ListreferralComponent;
  let fixture: ComponentFixture<ListreferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListreferralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListreferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

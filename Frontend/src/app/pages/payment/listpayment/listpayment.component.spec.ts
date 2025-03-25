import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListpaymentComponent } from './listpayment.component';

describe('ListpaymentComponent', () => {
  let component: ListpaymentComponent;
  let fixture: ComponentFixture<ListpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListpaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

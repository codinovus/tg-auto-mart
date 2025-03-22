import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatetransactionComponent } from './createupdatetransaction.component';

describe('CreateupdatetransactionComponent', () => {
  let component: CreateupdatetransactionComponent;
  let fixture: ComponentFixture<CreateupdatetransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatetransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatetransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatecryptowalletComponent } from './createupdatecryptowallet.component';

describe('CreateupdatecryptowalletComponent', () => {
  let component: CreateupdatecryptowalletComponent;
  let fixture: ComponentFixture<CreateupdatecryptowalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatecryptowalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatecryptowalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

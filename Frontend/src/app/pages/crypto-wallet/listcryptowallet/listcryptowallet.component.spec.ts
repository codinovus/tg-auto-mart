import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListcryptowalletComponent } from './listcryptowallet.component';

describe('ListcryptowalletComponent', () => {
  let component: ListcryptowalletComponent;
  let fixture: ComponentFixture<ListcryptowalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListcryptowalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListcryptowalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

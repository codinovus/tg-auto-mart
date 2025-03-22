import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatewalletComponent } from './createupdatewallet.component';

describe('CreateupdatewalletComponent', () => {
  let component: CreateupdatewalletComponent;
  let fixture: ComponentFixture<CreateupdatewalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatewalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatewalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

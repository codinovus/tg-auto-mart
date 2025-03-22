import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdateproductkeyComponent } from './createupdateproductkey.component';

describe('CreateupdateproductkeyComponent', () => {
  let component: CreateupdateproductkeyComponent;
  let fixture: ComponentFixture<CreateupdateproductkeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdateproductkeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdateproductkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

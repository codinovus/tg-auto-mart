import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdateproductComponent } from './createupdateproduct.component';

describe('CreateupdateproductComponent', () => {
  let component: CreateupdateproductComponent;
  let fixture: ComponentFixture<CreateupdateproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdateproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdateproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

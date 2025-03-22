import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdateproductcategoryComponent } from './createupdateproductcategory.component';

describe('CreateupdateproductcategoryComponent', () => {
  let component: CreateupdateproductcategoryComponent;
  let fixture: ComponentFixture<CreateupdateproductcategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdateproductcategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdateproductcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

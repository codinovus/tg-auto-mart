import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListproductCategoryComponent } from './listproduct-category.component';

describe('ListproductCategoryComponent', () => {
  let component: ListproductCategoryComponent;
  let fixture: ComponentFixture<ListproductCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListproductCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListproductCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

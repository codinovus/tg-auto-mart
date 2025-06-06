import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListproductComponent } from './listproduct.component';

describe('ListproductComponent', () => {
  let component: ListproductComponent;
  let fixture: ComponentFixture<ListproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

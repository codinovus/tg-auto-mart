import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListproductKeyComponent } from './listproduct-key.component';

describe('ListproductKeyComponent', () => {
  let component: ListproductKeyComponent;
  let fixture: ComponentFixture<ListproductKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListproductKeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListproductKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

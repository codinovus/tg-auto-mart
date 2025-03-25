import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListdisputeComponent } from './listdispute.component';

describe('ListdisputeComponent', () => {
  let component: ListdisputeComponent;
  let fixture: ComponentFixture<ListdisputeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListdisputeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListdisputeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListstoreComponent } from './liststore.component';

describe('ListstoreComponent', () => {
  let component: ListstoreComponent;
  let fixture: ComponentFixture<ListstoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListstoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListstoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

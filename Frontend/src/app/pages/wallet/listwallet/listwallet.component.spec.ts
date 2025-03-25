import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListwalletComponent } from './listwallet.component';

describe('ListwalletComponent', () => {
  let component: ListwalletComponent;
  let fixture: ComponentFixture<ListwalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListwalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

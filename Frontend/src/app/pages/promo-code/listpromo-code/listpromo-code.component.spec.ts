import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListpromoCodeComponent } from './listpromo-code.component';

describe('ListpromoCodeComponent', () => {
  let component: ListpromoCodeComponent;
  let fixture: ComponentFixture<ListpromoCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListpromoCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListpromoCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

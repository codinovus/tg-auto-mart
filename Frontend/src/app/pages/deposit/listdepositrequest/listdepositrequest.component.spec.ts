import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListdepositrequestComponent } from './listdepositrequest.component';

describe('ListdepositrequestComponent', () => {
  let component: ListdepositrequestComponent;
  let fixture: ComponentFixture<ListdepositrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListdepositrequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListdepositrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

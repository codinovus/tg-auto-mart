import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatedepositrequestComponent } from './createupdatedepositrequest.component';

describe('CreateupdatedepositrequestComponent', () => {
  let component: CreateupdatedepositrequestComponent;
  let fixture: ComponentFixture<CreateupdatedepositrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatedepositrequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatedepositrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

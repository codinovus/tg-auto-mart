import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatedisputeComponent } from './createupdatedispute.component';

describe('CreateupdatedisputeComponent', () => {
  let component: CreateupdatedisputeComponent;
  let fixture: ComponentFixture<CreateupdatedisputeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatedisputeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatedisputeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

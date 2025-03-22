import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateupdatestoreComponent } from './createupdatestore.component';

describe('CreateupdatestoreComponent', () => {
  let component: CreateupdatestoreComponent;
  let fixture: ComponentFixture<CreateupdatestoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateupdatestoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateupdatestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

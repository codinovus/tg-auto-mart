import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatupdateuserComponent } from './creatupdateuser.component';

describe('CreatupdateuserComponent', () => {
  let component: CreatupdateuserComponent;
  let fixture: ComponentFixture<CreatupdateuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatupdateuserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatupdateuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

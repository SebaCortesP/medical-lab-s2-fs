import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/auth';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

// Mock de AuthService
class AuthServiceMock {
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(false);
  login = jasmine.createSpy('login').and.returnValue(of({ token: 'abc' }));
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule, // <- Esto resuelve el error de *ngIf
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/auth';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

/* =========================
   Mock AuthService
========================= */
class AuthServiceMock {
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(false);
  login = jasmine.createSpy('login');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthServiceMock;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  /* =========================
     Básico
  ========================= */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* =========================
     ngOnInit
  ========================= */
  it('should redirect to home if user is already logged in', () => {
    authService.isLoggedIn.and.returnValue(true);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should not redirect if user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    component.ngOnInit();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  /* =========================
     onSubmit – form invalid
  ========================= */
  it('should not call login if form is invalid', () => {
    component.form.setValue({
      email: '',
      password: ''
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  /* =========================
     onSubmit – success
  ========================= */
  it('should login and navigate on success', fakeAsync(() => {
    component.form.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    authService.login.and.returnValue(of({ token: 'abc' }));

    component.onSubmit();
    tick();

    expect(authService.login).toHaveBeenCalledWith('test@test.com', '123456');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBeFalse();
  }));

  /* =========================
     onSubmit – error
  ========================= */
  it('should show error message on login error', fakeAsync(() => {
    component.form.setValue({
      email: 'test@test.com',
      password: 'wrong'
    });

    authService.login.and.returnValue(
      throwError(() => new Error('Invalid credentials'))
    );

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos');
    expect(component.loading).toBeFalse();
  }));
});

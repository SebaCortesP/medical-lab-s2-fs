import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password';
import { AuthService } from '../../../core/auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

// Mock de AuthService
class AuthServiceMock {
  forgotPassword = jasmine.createSpy('forgotPassword').and.returnValue(of({}));
}

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: AuthServiceMock;
  let router: Router;

  beforeEach(async () => {
    authService = new AuthServiceMock();

    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,           // componente standalone
        RouterTestingModule.withRoutes([]) // rutas vacías para test
      ],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    spyOn(router, 'navigate'); // espiamos navigate una vez

    fixture.detectChanges();
  });

  // ----------------------------------------
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.forgotForm.valid).toBeFalse();
  });

  it('should validate required email', () => {
    const email = component.forgotForm.controls['email'];
    email.setValue('');
    expect(email.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    const email = component.forgotForm.controls['email'];
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTrue();

    email.setValue('test@example.com');
    expect(email.errors).toBeNull();
  });

  it('should call authService.forgotPassword and navigate after success', fakeAsync(() => {
    // Arrange
    component.forgotForm.setValue({
      email: 'test@test.com'
    });

    authService.forgotPassword.and.returnValue(of({}));

    // Act
    component.submit();

    // Ejecuta el subscribe
    tick();

    // Assert intermedio
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(component.successMsg).toContain('Si el correo existe');
    expect(component.loading).toBeFalse();

    // Ejecuta el setTimeout(3000)
    tick(3000);

    // Assert final
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));


  it('should set errorMsg when forgotPassword fails', () => {
    component.forgotForm.setValue({ email: 'john@example.com' });

    authService.forgotPassword.and.returnValue(
      throwError(() => ({ error: { message: 'Correo no encontrado' } }))
    );

    component.submit();
    expect(component.errorMsg).toBe('Correo no encontrado');
    expect(component.loading).toBeFalse();
  });
});

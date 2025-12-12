import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { AuthService } from '../../../core/auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Dummy component para la ruta /login
@Component({ template: '' })
class DummyComponent { }

// Mock de AuthService
class AuthServiceMock {
  register = jasmine.createSpy('register').and.returnValue(of({}));
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthServiceMock;
  let router: Router;

  beforeEach(async () => {
    authService = new AuthServiceMock();

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: DummyComponent }
        ]),
      ],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true)); // Espiar navigate

    fixture.detectChanges();
  });

  // -------------------------
  // CREACIÓN DEL COMPONENTE
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------
  // VALIDACIÓN DE FORMULARIO
  it('should have invalid form initially', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    form.controls['name'].setValue('');
    form.controls['lastname'].setValue('');
    form.controls['email'].setValue('');
    form.controls['password'].setValue('');
    form.controls['confirmPassword'].setValue('');

    expect(form.valid).toBeFalse();
    expect(form.controls['name'].hasError('required')).toBeTrue();
    expect(form.controls['email'].hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    const email = component.registerForm.controls['email'];
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTrue();

    email.setValue('test@example.com');
    expect(email.errors).toBeNull();
  });

  it('should validate password strength', () => {
    const password = component.registerForm.controls['password'];
    password.setValue('weak'); // débil
    expect(password.hasError('weakPassword')).toBeTrue();

    password.setValue('Strong1!');
    expect(password.errors).toBeNull();
  });

  // -------------------------
  // SUBMIT EXITOSO
  it('should call authService.register and navigate after success', fakeAsync(() => {
    // Prepara formulario
    component.registerForm.setValue({
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'Strong1!',
      confirmPassword: 'Strong1!'
    });

    // Mock del servicio
    authService.register.and.returnValue(of({}));

    // Llamada al submit
    component.submit();

    // Avanza microtasks del subscribe
    tick();

    // Loading debería estar activo
    expect(component.loading).toBeTrue();

    // Avanza el timeout de 3s
    tick(3000);

    // Verifica que navigate fue llamado
    expect(router.navigate).toHaveBeenCalledWith(['/login']);

    // Loading apagado
    expect(component.loading).toBeFalse();

    // Formulario reseteado
    expect(component.registerForm.value.name).toBeNull();

    // Mensaje de éxito
    expect(component.successMsg).toContain('Usuario registrado correctamente');
  }));



  // -------------------------
  // SUBMIT FALLIDO
  it('should set errorMsg when register fails', () => {
    component.registerForm.setValue({
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'Strong1!',
      confirmPassword: 'Strong1!'
    });

    authService.register.and.returnValue(
      throwError(() => ({ error: { message: 'Email ya registrado' } }))
    );

    component.submit();

    expect(component.errorMsg).toBe('Email ya registrado');
    expect(component.loading).toBeFalse();
  });
});

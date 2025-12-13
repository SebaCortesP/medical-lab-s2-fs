import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth';
import { Router, RouterLink } from '@angular/router';

interface RegisterFormControls {
  name: AbstractControl;
  lastname: AbstractControl;
  email: AbstractControl;
  password: AbstractControl;
  confirmPassword: AbstractControl;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  successMsg = '';
  errorMsg = '';
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.matchPasswords });
  }

  // Validación personalizada para contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const valid = hasUpperCase && hasNumber && hasSymbol;
    return valid ? null : { weakPassword: true };
  }

  // Validación para que password y confirmPassword coincidan
  matchPasswords(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  submit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    const formValue = this.registerForm.value;

    const payload = {
      name: formValue.name,
      lastname: formValue.lastname,
      email: formValue.email,
      password: formValue.password,
      role: { id: 2 } // PACIENTE por defecto
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMsg = 'Usuario registrado correctamente. Serás redirigido al login...';
        this.loading = false;
        this.registerForm.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // redirige después de 3 segundos
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error registrando usuario';
        this.loading = false;
      }
    });
  }
  get f(): RegisterFormControls {
    return this.registerForm.controls as unknown as RegisterFormControls;
  }

}


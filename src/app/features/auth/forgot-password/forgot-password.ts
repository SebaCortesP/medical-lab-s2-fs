import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent implements OnInit{

  successMsg = '';
  errorMsg = '';
  loading = false;
  forgotForm!: FormGroup; 

  constructor(private fb: FormBuilder,   private authService: AuthService,
    private router: Router) { }    
  
  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  get f() {
    return this.forgotForm.controls;
  }

  submit() {
    this.successMsg = '';
    this.errorMsg = '';

    if (this.forgotForm.invalid) return;

    this.loading = true;

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.successMsg = 'Si el correo existe, se envió una nueva contraseña. Revisa tu bandeja.';
        this.loading = false;
        this.forgotForm.reset();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error procesando la solicitud';
        this.loading = false;
      }
    });
  }
}

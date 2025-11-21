import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  form: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
ngOnInit() {
  if (this.authService.isLoggedIn()) {
    this.router.navigate(['/']); 
  }
}
  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: res => {
        // login exitoso, ya guardado token en AuthService
        this.router.navigate(['/']); // redirige al home
      },
      error: err => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}

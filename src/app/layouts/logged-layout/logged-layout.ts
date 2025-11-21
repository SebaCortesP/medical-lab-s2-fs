import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';



interface JwtPayload {
  sub: string;
  userId: number;
  rol: string;
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-logged-layout',
  templateUrl: 'logged-layout.html',
  styleUrls: ['logged-layout.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink
  ]
})
export class LoggedLayoutComponent {
  loading = true;
  pacient: any = null;
  results: any[] = [];
  errorMsg = '';
  role: string | null = null;
  constructor(private auth: AuthService, private router: Router) { }
  userRole: any = null;
  ngOnInit() {
    this.auth.role$.subscribe(r => {
      this.role = r;
      console.log("Mi rol:", r);
    });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMsg = 'No hay token, inicia sesión nuevamente.';
        this.loading = false;
        return;
      }
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('decoded', decoded);
      this.userRole = decoded.rol;
    } catch (err) {
      this.errorMsg = 'Error procesando el token.';
      this.loading = false;
    }
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  usuarioId: number;
  rol: string;
  iat: number;
  exp: number;
}
interface LoginResponse {
  success: boolean;
  message: string;
  data: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private roleSubject = new BehaviorSubject<string | null>(null);
  public role$ = this.roleSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Cargar token de localStorage al iniciar
    const token = localStorage.getItem('token');
    if (token) this.currentUserSubject.next(token);
  }

  /** Login usando microservicio A */
  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.config.apiA}/users/login`; // URL dinámica
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap(res => {
        if (res.success && res.data) {
          const token = res.data;
          localStorage.setItem('token', token);
          this.currentUserSubject.next(token);
          // Decodificar token
          const decoded: any = jwtDecode(token);

          // IMPORTANTE: debe coincidir con la key donde viene el rol
          const role = decoded.role || null;
          // Guardar globalmente el rol
          this.roleSubject.next(role);
        }
      })
    );
  }


  /** Registro de usuario */
  register(data: any): Observable<any> {
    const url = `${this.config.apiA}/users/register`; // URL dinámica
    return this.http.post(url, data);
  }

  /** Logout */
  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /** Token JWT actual */
  get token(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token'); // leer en tiempo real
    return !!token;
  }

  get userId(): number | null {
    if (!this.token) return null;
    const payload = jwtDecode<TokenPayload>(this.token);
    return payload.usuarioId; // o como venga en tu token
  }


  loadUserFromToken(): void {
  const token = localStorage.getItem('token');
  if (!token) {
    this.roleSubject.next(null);
    return;
  }

  try {
    const decoded: any = jwtDecode(token);

    const role = decoded.role || decoded.userRole || null;

    this.roleSubject.next(role); // <-- repuebla el rol después de refrescar
  } catch (err) {
    this.roleSubject.next(null);
  }
}

}

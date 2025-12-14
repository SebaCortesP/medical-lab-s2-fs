import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoggedLayoutComponent } from './logged-layout';
import { AuthService } from '../../core/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import * as jwt from 'jwt-decode';

// ----------------------
// Mock AuthService
class AuthServiceMock {
  private roleSubject = new BehaviorSubject<string | null>('user');
  role$ = this.roleSubject.asObservable();

  logout = jasmine.createSpy('logout');

  emitRole(role: string) {
    this.roleSubject.next(role);
  }
}

describe('LoggedLayoutComponent', () => {
  let component: LoggedLayoutComponent;
  let fixture: ComponentFixture<LoggedLayoutComponent>;
  let authService: AuthServiceMock;
  let router: Router;

  beforeEach(async () => {
    authService = new AuthServiceMock();

    await TestBed.configureTestingModule({
      imports: [
        LoggedLayoutComponent,
        CommonModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoggedLayoutComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  beforeEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------
  it('should update role when AuthService emits', () => {
    authService.emitRole('admin');

    fixture.detectChanges();

    expect(component.role).toBe('admin');
  });

  // -------------------------------------------------
  it('should set error if token is missing', () => {
    component.ngOnInit();

    expect(component.errorMsg).toBe('No hay token, inicia sesión nuevamente.');
    expect(component.loading).toBeFalse();
  });

  it('should decode token and set user role', () => {
    const payload = {
      sub: 'abc',
      userId: 1,
      rol: 'admin',
      iat: 0,
      exp: 9999999999
    };

    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem('token', token);

    component.ngOnInit();

    expect(component.userRole).toBe('admin');
    expect(component.errorMsg).toBe('');
  });

  it('should set error if token is invalid', () => {
    localStorage.setItem('token', 'invalid.token');

    component.ngOnInit();

    expect(component.errorMsg).toBe('Error procesando el token.');
    expect(component.loading).toBeFalse();
  });

  // -------------------------------------------------
  it('should logout and navigate to login', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

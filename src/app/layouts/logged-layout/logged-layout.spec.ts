import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoggedLayoutComponent } from './logged-layout';
import { AuthService } from '../../core/auth';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import * as jwt from 'jwt-decode';


// Mock de AuthService
class AuthServiceMock {
    private readonly roleSubject = new BehaviorSubject<string>('user');
    role$ = this.roleSubject.asObservable();

    logout = jasmine.createSpy('logout');

    emitRole(value: string) {
        this.roleSubject.next(value);
    }
}

// Mock del Router
class RouterMock {
    navigate = jasmine.createSpy('navigate');
}

// Mock global de jwtDecode
spyOn(jwt, 'jwtDecode').and.returnValue({
    sub: 'abc',
    userId: 1,
    rol: 'admin',
    iat: 0,
    exp: 0
});


describe('LoggedLayoutComponent', () => {
    let component: LoggedLayoutComponent;
    let fixture: ComponentFixture<LoggedLayoutComponent>;
    let authService: AuthServiceMock;
    let router: RouterMock;

    beforeEach(async () => {
        authService = new AuthServiceMock();
        router = new RouterMock();

        await TestBed.configureTestingModule({
            imports: [
                LoggedLayoutComponent,
                CommonModule,
                RouterTestingModule
            ],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoggedLayoutComponent);
        component = fixture.componentInstance;
    });

    beforeEach(() => {
        // Limpia el localStorage antes de cada test
        localStorage.clear();
    });

    // ----------------------------------------------------------------
    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    // ----------------------------------------------------------------
    // ROLE SUBSCRIPTION
    it('should update role when AuthService emits', () => {
        authService.emitRole('admin');

        fixture.detectChanges();

        expect(component.role).toBe('admin');
    });

    // ----------------------------------------------------------------
    // TOKEN MISSING
    it('should set error if token is missing', () => {
        component.ngOnInit();

        expect(component.errorMsg).toBe('No hay token, inicia sesión nuevamente.');
        expect(component.loading).toBeFalse();
    });

    // ----------------------------------------------------------------
    // TOKEN VALID
    it('should decode token and set user role', () => {
        const fakeToken = 'token123';
        localStorage.setItem('token', fakeToken);

        spyOn(jwt, 'jwtDecode').and.returnValue({
            sub: 'abc',
            userId: 1,
            rol: 'admin',
            iat: 0,
            exp: 0
        });

        component.ngOnInit();

        expect(jwt.jwtDecode).toHaveBeenCalledWith(fakeToken);
        expect(component.userRole).toBe('admin');
        expect(component.errorMsg).toBe('');
    });

    // ----------------------------------------------------------------
    // TOKEN INVALID
    it('should set error if token is invalid', () => {
        const fakeToken = 'invalid';
        localStorage.setItem('token', fakeToken);

        spyOn(jwt, 'jwtDecode').and.throwError('Invalid token');

        component.ngOnInit();

        expect(component.errorMsg).toBe('Error procesando el token.');
        expect(component.loading).toBeFalse();
    });

    // ----------------------------------------------------------------
    // LOGOUT
    it('should logout and navigate to login', () => {
        component.logout();

        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
});

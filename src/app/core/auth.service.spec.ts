import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from '../services/config.service';
import { of } from 'rxjs';
import * as jwtDecodeLib from 'jwt-decode';

describe('AuthService', () => {

  let service: AuthService;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(() => {
    const configMock = { apiA: 'https://api-a.test', apiB: 'https://api-b.test' };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);

    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });
  function buildToken(payload: object): string {
    return (
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(JSON.stringify(payload)) +
      '.signature'
    );
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store token and role', () => {
    const token = buildToken({ role: 'admin', usuarioId: 10 });

    service.login('test@mail.com', '1234').subscribe();

    const req = httpMock.expectOne(`${configService.apiA}/users/login`);
    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
      message: 'ok',
      data: token,
    });

    expect(localStorage.getItem('token')).toBe(token);

    service.role$.subscribe(role => {
      expect(role).toBe('admin');
    });
  });

  it('should register user', () => {
    const userData = { name: 'Test' };
    service.register(userData).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${configService.apiA}/users`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should call forgotPassword', () => {
    const data = { email: 'test@test.com' };
    service.forgotPassword(data).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${configService.apiA}/users/forgot-password`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should logout user', () => {
    localStorage.setItem('token', 'abc');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    service.currentUser$.subscribe(user => expect(user).toBeNull());
  });

  it('should return correct token', () => {
    localStorage.setItem('token', 'abc');
    expect(service.token).toBe('abc');
  });

  it('should return false for isLoggedIn when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });


  it('loadUserFromToken should set role if token is valid', () => {
    const token = buildToken({ role: 'pacient' });
    localStorage.setItem('token', token);

    service.loadUserFromToken();

    service.role$.subscribe(role => {
      expect(role).toBe('pacient');
    });
  });


  it('loadUserFromToken should set role null if no token', () => {
    service.loadUserFromToken();
    service.role$.subscribe(role => expect(role).toBeNull());
  });

  it('loadUserFromToken should set role null if token is invalid', () => {
    localStorage.setItem('token', 'invalid.token.value');

    service.loadUserFromToken();

    service.role$.subscribe(role => {
      expect(role).toBeNull();
    });
  });

  it('should return userId from token', () => {
    const token = buildToken({ usuarioId: 99 });
    localStorage.setItem('token', token);

    expect(service.userId).toBe(99);
  });


  it('isLoggedIn should return true if token exists', () => {
    localStorage.setItem('token', 'dummy');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('isLoggedIn should return false if no token', () => {
    localStorage.removeItem('token');
    expect(service.isLoggedIn()).toBeFalse();
  });

});

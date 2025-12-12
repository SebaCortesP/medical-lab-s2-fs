import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from '../services/config.service';
import { of } from 'rxjs';
import * as jwtDecodeModule from 'jwt-decode';

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

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set token and role', () => {
    const fakeToken = 'fake.jwt.token';
    const fakeResponse = { success: true, message: 'ok', data: fakeToken };
    const fakeDecoded = { role: 'admin', usuarioId: 1 };

    spyOn(jwtDecodeModule, 'jwtDecode').and.returnValue(fakeDecoded);

    service.login('test@test.com', '1234').subscribe(res => {
      expect(res).toEqual(fakeResponse);
      expect(localStorage.getItem('token')).toBe(fakeToken);
      service.role$.subscribe(role => expect(role).toBe('admin'));
      service.currentUser$.subscribe(token => expect(token).toBe(fakeToken));
    });

    const req = httpMock.expectOne(`${configService.apiA}/users/login`);
    expect(req.request.method).toBe('POST');
    req.flush(fakeResponse);
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

  it('should return true for isLoggedIn', () => {
    localStorage.setItem('token', 'abc');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false for isLoggedIn when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should decode userId from token', () => {
    const fakeToken = 'fake.jwt.token';
    localStorage.setItem('token', fakeToken);
    spyOn(jwtDecodeModule, 'jwtDecode').and.returnValue({ usuarioId: 123 });
    expect(service.userId).toBe(123);
  });

  it('loadUserFromToken should set role if token valid', () => {
    const fakeToken = 'fake.jwt.token';
    localStorage.setItem('token', fakeToken);
    spyOn(jwtDecodeModule, 'jwtDecode').and.returnValue({ role: 'admin' });

    service.loadUserFromToken();
    service.role$.subscribe(role => expect(role).toBe('admin'));
  });

  it('loadUserFromToken should set role null if no token', () => {
    service.loadUserFromToken();
    service.role$.subscribe(role => expect(role).toBeNull());
  });

  it('loadUserFromToken should set role null if decode fails', () => {
    const fakeToken = 'bad.token';
    localStorage.setItem('token', fakeToken);
    spyOn(jwtDecodeModule, 'jwtDecode').and.throwError('Invalid token');

    service.loadUserFromToken();
    service.role$.subscribe(role => expect(role).toBeNull());
  });
});

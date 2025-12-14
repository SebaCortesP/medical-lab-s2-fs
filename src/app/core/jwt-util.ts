import { jwtDecode } from 'jwt-decode';

export function decodeJwt<T>(token: string): T {
  return jwtDecode<T>(token);
}

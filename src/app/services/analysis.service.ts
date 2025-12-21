import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private readonly config = inject(ConfigService);
  private readonly apiLab = this.config.apiB;
  private readonly apiResult = this.config.apiC;

  constructor(private readonly http: HttpClient) {}

  getPacientByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiLab}/pacients/by-user/${userId}`);
  }

  getResultsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiResult}/results/by-user/${userId}`);
  }
}

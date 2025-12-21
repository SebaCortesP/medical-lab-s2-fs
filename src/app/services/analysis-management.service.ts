import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisManagementService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly api = this.config.apiB;
  private readonly apiA = this.config.apiA;
  private readonly apiC = this.config.apiC;

  // Analyses
  getAnalyses(): Observable<any[]> {
    return this.http.get<any>(`${this.api}/analyses`).pipe(
      map(res => res.data) // extraemos data
    );
  }

  createAnalysis(data: { name: string, price: number, durationMinutes: number, labId: number }): Observable<any> {
    return this.http.post(`${this.api}/analyses`, data);
  }

  // Results
  createResult(data: { pacientId: number, analysisId: number, labId: number, resultValue: string, resultDetails: string, resultDate: string }): Observable<any> {
    return this.http.post(`${this.api}/results`, data);
  }

  // Labs
  getLabs(): Observable<any[]> {
    return this.http.get<any>(`${this.api}/labs`).pipe(
      map(res => res.data) // extraemos data
    );
  }

  getPacientes(): Observable<any[]> {
    return this.http.get<any>(`${this.apiA}/pacients`).pipe(
      map(res => res.data) // extraemos la propiedad data
    );
  }
}

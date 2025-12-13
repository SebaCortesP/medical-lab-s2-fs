import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { AnalysisService } from '../../../services/analysis.service';

interface JwtPayload {
  sub: string;
  userId: number;
  rol: string;
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-analysis-results',
  standalone: true,
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
  imports: [CommonModule],
})
export class ResultsComponent implements OnInit {

  loading = true;
  pacient: any = null;
  results: any[] = [];
  errorMsg = '';

  selectedResult: any = null;

  constructor(private readonly analysisService: AnalysisService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMsg = 'No hay token, inicia sesión nuevamente.';
        this.loading = false;
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);
      const userId = decoded.userId;

      if (!userId) {
        this.errorMsg = 'No se pudo obtener el usuario del token.';
        this.loading = false;
        return;
      }

      this.loading = true;

      // Ahora solo traemos resultados por userId
      this.analysisService.getResultsByUser(userId).subscribe({
        next: (res) => {
          console.log('Resultados recibidos:', res);
          this.results = res.data;
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Error al obtener los resultados del usuario.';
          this.loading = false;
        }
      });

    } catch (err) {
      this.errorMsg = 'Error procesando el token.';
      this.loading = false;
    }
  }


  // ---------------- Modal ----------------
  openModal(result: any) {
    this.selectedResult = result;
  }

  closeModal() {
    this.selectedResult = null;
  }
}

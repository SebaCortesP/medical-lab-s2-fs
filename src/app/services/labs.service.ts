import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lab {
  id?: number;
  name: string;
  address: string;
  phone: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class LabsService {
  private readonly config = inject(ConfigService);
  private readonly apiLab = this.config.apiB + '/labs';

  constructor(private readonly http: HttpClient) { }

  // Crear Lab
  createLab(lab: Lab): Observable<any> {
    return this.http.post(this.apiLab, lab);
  }

  // Listar todos
  getLabs(): Observable<ApiResponse<Lab[]>> {
    return this.http.get<ApiResponse<Lab[]>>(this.apiLab);
  }

  // Obtener por ID
  getLabById(id: number): Observable<Lab> {
    return this.http.get<Lab>(`${this.apiLab}/${id}`);
  }

  // Actualizar
  updateLab(id: number, lab: Lab): Observable<any> {
    return this.http.put(`${this.apiLab}/${id}`, lab);
  }

  // Eliminar
  deleteLab(id: number): Observable<any> {
    return this.http.delete(`${this.apiLab}/${id}`);
  }
}

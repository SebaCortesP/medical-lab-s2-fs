import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalysisManagementService } from '../../../services/analysis-management.service';

@Component({
  selector: 'app-analysis-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './analysis.html',
  styleUrls: ['./analysis.scss']
})
export class AnalysisManagementComponent implements OnInit {
  private service = inject(AnalysisManagementService);
  private fb = inject(FormBuilder);

  analyses: any[] = [];
  labs: any[] = [];
  pacientes: any[] = [];

  loadingAnalyses = true;
  loadingLabs = true;

  createAnalysisForm: FormGroup;
  createResultForm: FormGroup;

  errorMsg = '';
  successMsg = '';

  constructor() {
    this.createAnalysisForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, Validators.required],
      durationMinutes: [30, Validators.required],
      labId: [null, Validators.required]
    });

    this.createResultForm = this.fb.group({
      pacientId: [null, Validators.required],
      analysisId: [null, Validators.required],
      labId: [null, Validators.required],
      resultValue: ['', Validators.required],
      resultDetails: [''],
      resultDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAnalyses();
    this.loadLabs();
    this.loadPacients(); // cargamos pacientes para el dropdown
  }

  loadAnalyses() {
    this.loadingAnalyses = true;
    this.service.getAnalyses().subscribe({
      next: data => {
        this.analyses = data;
        this.loadingAnalyses = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar los análisis';
        this.loadingAnalyses = false;
      }
    });
  }

  loadPacients() {
    this.service.getPacientes().subscribe({
      next: pacientes => {
        this.pacientes = pacientes;
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los pacientes';
      }
    });
  }

  loadLabs() {
    this.loadingLabs = true;
    this.service.getLabs().subscribe({
      next: data => {
        this.labs = data;
        this.loadingLabs = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar laboratorios';
        this.loadingLabs = false;
      }
    });
  }

  submitAnalysis() {
    if (this.createAnalysisForm.invalid) return;

    const formValue = this.createAnalysisForm.value;
    const payload = {
      name: formValue.name || '',
      price: Number(formValue.price),
      durationMinutes: Number(formValue.durationMinutes),
      labId: Number(formValue.labId)
    };

    this.service.createAnalysis(payload).subscribe({
      next: () => {
        this.successMsg = 'Análisis creado correctamente';
        this.createAnalysisForm.reset();
        this.loadAnalyses();
        this.errorMsg = '';
      },
      error: () => this.errorMsg = 'Error al crear el análisis'
    });
  }

  submitResult() {
    if (this.createResultForm.invalid) return;

    const formValue = this.createResultForm.value;
    const payload = {
      pacientId: Number(formValue.pacientId),
      analysisId: Number(formValue.analysisId),
      labId: Number(formValue.labId),
      resultValue: formValue.resultValue || '',
      resultDetails: formValue.resultDetails || '',
      resultDate: formValue.resultDate || new Date().toISOString().split('T')[0]
    };

    this.service.createResult(payload).subscribe({
      next: () => {
        this.successMsg = 'Resultado creado correctamente';
        this.createResultForm.reset();
        this.errorMsg = '';
      },
      error: () => this.errorMsg = 'Error al crear el resultado'
    });
  }
}

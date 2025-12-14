import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnalysisManagementComponent } from './analysis';
import { AnalysisManagementService } from '../../../services/analysis-management.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

class AnalysisManagementServiceMock {
  getAnalyses = jasmine.createSpy().and.returnValue(of([]));
  getLabs = jasmine.createSpy().and.returnValue(of([]));
  getPacientes = jasmine.createSpy().and.returnValue(of([]));
  createAnalysis = jasmine.createSpy().and.returnValue(of({}));
  createResult = jasmine.createSpy().and.returnValue(of({}));
  createAssignment = jasmine.createSpy().and.returnValue(of({}));
}

describe('AnalysisManagementComponent', () => {
  let component: AnalysisManagementComponent;
  let fixture: ComponentFixture<AnalysisManagementComponent>;
  let service: AnalysisManagementServiceMock;

  beforeEach(async () => {
    service = new AnalysisManagementServiceMock();

    await TestBed.configureTestingModule({
      imports: [
        AnalysisManagementComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AnalysisManagementService, useValue: service }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ------------------------------------
  it('should call load methods on init', () => {
    expect(service.getAnalyses).toHaveBeenCalled();
    expect(service.getLabs).toHaveBeenCalled();
    expect(service.getPacientes).toHaveBeenCalled();
  });

  // ------------------------------------
  it('should display error and success messages', () => {
    component.errorMsg = 'Error test';
    component.successMsg = 'Success test';
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Error test');
    expect(text).toContain('Success test');
  });

  // ------------------------------------
  it('should validate createAnalysisForm', () => {
    const form = component.createAnalysisForm;
    expect(form.valid).toBeFalse();

    form.setValue({
      name: 'Hemograma',
      price: 10000,
      durationMinutes: 30,
      labId: 1
    });

    expect(form.valid).toBeTrue();
  });

  // ------------------------------------
  it('should submit analysis successfully', fakeAsync(() => {
    component.createAnalysisForm.setValue({
      name: 'Hemograma',
      price: 10000,
      durationMinutes: 30,
      labId: 1
    });

    component.submitAnalysis();
    tick();

    expect(service.createAnalysis).toHaveBeenCalled();
    expect(component.successMsg).toBeTruthy();
  }));

  // ------------------------------------
  it('should handle error on submitAnalysis', fakeAsync(() => {
    service.createAnalysis.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.createAnalysisForm.setValue({
      name: 'Hemograma',
      price: 10000,
      durationMinutes: 30,
      labId: 1
    });

    component.submitAnalysis();
    tick();

    expect(component.errorMsg).toBeTruthy();
  }));

  // ------------------------------------
  it('should not submit analysis if form invalid', () => {
    component.createAnalysisForm.reset();
    component.submitAnalysis();

    expect(service.createAnalysis).not.toHaveBeenCalled();
  });

  // ------------------------------------
  it('should submit result successfully', fakeAsync(() => {
    component.createResultForm.setValue({
      pacientId: 1,
      analysisId: 1,
      labId: 1,
      resultValue: '350',
      resultDetails: 'OK',
      resultDate: '2025-12-11'
    });

    component.submitResult();
    tick();

    expect(service.createResult).toHaveBeenCalled();
    expect(component.successMsg).toBeTruthy();
  }));

  // ------------------------------------
  it('should not submit result if form invalid', () => {
    component.createResultForm.reset();
    component.submitResult();

    expect(service.createResult).not.toHaveBeenCalled();
  });

  // ------------------------------------
  it('should bind form values to inputs', () => {
    component.createAnalysisForm.patchValue({ name: 'Hemograma' });
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css('input[formControlName="name"]')
    ).nativeElement;

    expect(input.value).toBe('Hemograma');
  });

  it('should load analyses successfully', () => {
    service.getAnalyses.and.returnValue(of([{ id: 1 }]));

    component.loadAnalyses();

    expect(component.loadingAnalyses).toBeFalse();
    expect(component.analyses.length).toBe(1);
  });

  it('should set errorMsg when loadAnalyses fails', () => {
    service.getAnalyses.and.returnValue(throwError(() => ({})));

    component.loadAnalyses();

    expect(component.errorMsg).toBe('Error al cargar los análisis');
    expect(component.loadingAnalyses).toBeFalse();
  });

  it('should set errorMsg when loadPacients fails', () => {
    service.getPacientes.and.returnValue(throwError(() => ({})));

    component.loadPacients();

    expect(component.errorMsg).toBe('No se pudieron cargar los pacientes');
  });

  it('should not submit analysis if form is invalid', () => {
    component.createAnalysisForm.reset();

    component.submitAnalysis();

    expect(service.createAnalysis).not.toHaveBeenCalled();
  });

  it('should create analysis successfully', () => {
    service.createAnalysis.and.returnValue(of({}));
    service.getAnalyses.and.returnValue(of([]));

    component.createAnalysisForm.setValue({
      name: 'Test',
      price: 100,
      durationMinutes: 30,
      labId: 1
    });

    component.submitAnalysis();

    expect(component.successMsg).toBe('Análisis creado correctamente');
    expect(component.errorMsg).toBe('');
  });

  it('should set errorMsg when createAnalysis fails', () => {
    service.createAnalysis.and.returnValue(throwError(() => ({})));

    component.createAnalysisForm.setValue({
      name: 'Test',
      price: 100,
      durationMinutes: 30,
      labId: 1
    });

    component.submitAnalysis();

    expect(component.errorMsg).toBe('Error al crear el análisis');
  });



  it('should set errorMsg when createResult fails', () => {
    service.createResult.and.returnValue(throwError(() => ({})));

    component.createResultForm.setValue({
      pacientId: 1,
      analysisId: 1,
      labId: 1,
      resultValue: 'OK',
      resultDetails: '',
      resultDate: '2024-01-01'
    });

    component.submitResult();

    expect(component.errorMsg).toBe('Error al crear el resultado');
  });

  it('should set errorMsg and stop loading when loadLabs fails', fakeAsync(() => {
    // Arrange
    service.getLabs.and.returnValue(
      throwError(() => new Error('API error'))
    );

    // Act
    component.loadLabs();
    tick();

    // Assert
    expect(service.getLabs).toHaveBeenCalled();
    expect(component.errorMsg).toBe('Error al cargar laboratorios');
    expect(component.loadingLabs).toBeFalse();
  }));


});
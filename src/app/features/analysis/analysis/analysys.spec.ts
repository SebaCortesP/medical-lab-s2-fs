import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnalysisManagementComponent } from './analysis';
import { AnalysisManagementService } from '../../../services/analysis-management.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

// Mock del servicio
class AnalysisManagementServiceMock {
  getAnalyses = jasmine.createSpy('getAnalyses').and.returnValue(of([]));
  getLabs = jasmine.createSpy('getLabs').and.returnValue(of([]));
  getPacientes = jasmine.createSpy('getPacientes').and.returnValue(of([]));
  createAnalysis = jasmine.createSpy('createAnalysis').and.returnValue(of({}));
  createResult = jasmine.createSpy('createResult').and.returnValue(of({}));
  createAssignment = jasmine.createSpy('createAssignment').and.returnValue(of({}));
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

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call load methods on init', () => {
    expect(service.getAnalyses).toHaveBeenCalled();
    expect(service.getLabs).toHaveBeenCalled();
    expect(service.getPacientes).toHaveBeenCalled();
  });

  it('should show errorMsg and successMsg in template', () => {
    component.errorMsg = 'Error test';
    component.successMsg = 'Éxito test';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-red-500')?.textContent).toContain('Error test');
    expect(compiled.querySelector('.text-green-500')?.textContent).toContain('Éxito test');
  });

  it('should validate createAnalysisForm', () => {
    const form = component.createAnalysisForm;
    expect(form.valid).toBeFalse();
    form.setValue({ name: 'Hemograma', price: 10000, durationMinutes: 30, labId: 1 });
    expect(form.valid).toBeTrue();
  });

  it('should submitAnalysis successfully', fakeAsync(() => {
    component.createAnalysisForm.setValue({ name: 'Hemograma', price: 10000, durationMinutes: 30, labId: 1 });
    component.submitAnalysis();
    tick();
    expect(service.createAnalysis).toHaveBeenCalledWith({
      name: 'Hemograma',
      price: 10000,
      durationMinutes: 30,
      labId: 1
    });
    expect(component.successMsg).toBe('Análisis creado correctamente');
  }));

  it('should handle error on submitAnalysis', fakeAsync(() => {
    service.createAnalysis.and.returnValue(throwError(() => ({ error: 'fail' })));
    component.createAnalysisForm.setValue({ name: 'Hemograma', price: 10000, durationMinutes: 30, labId: 1 });
    component.submitAnalysis();
    tick();
    expect(component.errorMsg).toBe('Error al crear el análisis');
  }));

  it('should render analyses in table', () => {
    component.analyses = [
      { id: 1, name: 'Hemograma', price: 10000, durationMinutes: 30, labName: 'Lab 1' },
      { id: 2, name: 'Bioquímica', price: 20000, durationMinutes: 45, labName: 'Lab 2' }
    ];
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Hemograma');
    expect(rows[1].textContent).toContain('Bioquímica');
  });

  it('should bind formControl values to inputs', () => {
    component.createAnalysisForm.setValue({ name: 'Hemograma', price: 15000, durationMinutes: 30, labId: 1 });
    fixture.detectChanges();

    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]')).nativeElement;
    expect(nameInput.value).toBe('Hemograma');

    const priceInput = fixture.debugElement.query(By.css('input[formControlName="price"]')).nativeElement;
    expect(priceInput.value).toBe('15000');
  });

  it('should render labs and pacientes options', () => {
    component.labs = [{ id: 1, name: 'Lab 1' }];
    component.pacientes = [{ id: 1, name: 'Juan', lastname: 'Perez' }];
    fixture.detectChanges();

    const labOption = fixture.nativeElement.querySelector('select[formControlName="labId"] option:nth-child(2)');
    expect(labOption?.textContent).toContain('Lab 1');

    const pacientOption = fixture.nativeElement.querySelector('select[formControlName="pacientId"] option:nth-child(2)');
    expect(pacientOption?.textContent).toContain('Juan Perez');
  });

  it('should submitResult successfully', fakeAsync(() => {
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
    expect(component.successMsg).toBe('Resultado creado correctamente');
  }));

  it('should handle error on submitResult', fakeAsync(() => {
    service.createResult.and.returnValue(throwError(() => ({ error: 'fail' })));
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
    expect(component.errorMsg).toBe('Error al crear el resultado');
  }));

  it('should trigger submitAnalysis on form submit', () => {
    spyOn(component, 'submitAnalysis');
    const form = fixture.debugElement.query(By.css('form[formGroup="createAnalysisForm"]'));
    form.triggerEventHandler('ngSubmit', {});
    expect(component.submitAnalysis).toHaveBeenCalled();
  });

  it('should trigger submitResult on form submit', () => {
    spyOn(component, 'submitResult');
    const form = fixture.debugElement.queryAll(By.css('form'))[1]; // segundo form
    form.triggerEventHandler('ngSubmit', {});
    expect(component.submitResult).toHaveBeenCalled();
  });

  describe('AnalysisManagementComponent Template Branches', () => {
    let component: AnalysisManagementComponent;
    let fixture: ComponentFixture<AnalysisManagementComponent>;
    let service: AnalysisManagementServiceMock;

    beforeEach(async () => {
      service = new AnalysisManagementServiceMock();

      await TestBed.configureTestingModule({
        imports: [AnalysisManagementComponent],
        providers: [{ provide: AnalysisManagementService, useValue: service }]
      }).compileComponents();

      fixture = TestBed.createComponent(AnalysisManagementComponent);
      component = fixture.componentInstance;
    });

    it('should show errorMsg and successMsg conditionally', () => {
      component.errorMsg = 'Error test';
      component.successMsg = '';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error test');

      component.errorMsg = '';
      component.successMsg = 'Éxito test';
      fixture.detectChanges();
      expect(compiled.textContent).toContain('Éxito test');
    });

    it('should display empty message when no analyses', () => {
      component.analyses = [];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('No hay resultados disponibles'); // si tu template tiene mensaje para lista vacía, ajusta texto
    });

    it('should handle loadAnalyses error', fakeAsync(() => {
      service.getAnalyses.and.returnValue(throwError(() => new Error('fail')));
      component.loadAnalyses();
      tick();
      expect(component.errorMsg).toBe('Error al cargar los análisis');
      expect(component.loadingAnalyses).toBeFalse();
    }));

    it('should handle loadLabs error', fakeAsync(() => {
      service.getLabs.and.returnValue(throwError(() => new Error('fail')));
      component.loadLabs();
      tick();
      expect(component.errorMsg).toBe('Error al cargar laboratorios');
      expect(component.loadingLabs).toBeFalse();
    }));

    it('should handle loadPacientes error', fakeAsync(() => {
      service.getPacientes.and.returnValue(throwError(() => new Error('fail')));
      component.loadPacients();
      tick();
      expect(component.errorMsg).toBe('No se pudieron cargar los pacientes');
    }));

    it('should not submitAnalysis if form invalid', () => {
      component.createAnalysisForm.reset();
      component.submitAnalysis();
      expect(service.createAnalysis).not.toHaveBeenCalled();
    });

    it('should not submitResult if form invalid', () => {
      component.createResultForm.reset();
      component.submitResult();
      expect(service.createResult).not.toHaveBeenCalled();
    });
  });

});

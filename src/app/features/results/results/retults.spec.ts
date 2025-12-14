import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResultsComponent } from './results';
import { AnalysisService } from '../../../services/analysis.service';
import { of, throwError } from 'rxjs';

class AnalysisServiceMock {
  getResultsByUser = jasmine.createSpy('getResultsByUser');
}

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let service: AnalysisServiceMock;

  beforeEach(async () => {
    service = new AnalysisServiceMock();

    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [{ provide: AnalysisService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---------------- Creación
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------- Token inválido
  it('should set errorMsg if no token', () => {
    localStorage.removeItem('token');
    component.ngOnInit();

    expect(component.errorMsg).toBe('No hay token, inicia sesión nuevamente.');
    expect(component.loading).toBeFalse();
  });

  it('should set errorMsg if token is malformed', () => {
    localStorage.setItem('token', 'malformed.token');
    component.ngOnInit();

    expect(component.errorMsg).toBe('Error procesando el token.');
    expect(component.loading).toBeFalse();
  });

  it('should set errorMsg if token has no userId', () => {
    const payload = { sub: '123', rol: 'user' };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem('token', token);

    component.ngOnInit();

    expect(component.errorMsg).toBe('No se pudo obtener el usuario del token.');
    expect(component.loading).toBeFalse();
  });

  // ---------------- Token válido
  it('should load results when token has userId', fakeAsync(() => {
    const payload = { userId: 42 };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem('token', token);

    const resultsMock = {
      data: [
        { analysisName: 'Hemograma', labName: 'Lab1', resultValue: 123, resultDate: '2025-12-11' }
      ]
    };

    service.getResultsByUser.and.returnValue(of(resultsMock));

    component.ngOnInit();
    tick();

    expect(component.results).toEqual(resultsMock.data);
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('');
  }));

  it('should set errorMsg if getResultsByUser fails', fakeAsync(() => {
    const payload = { userId: 42 };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    localStorage.setItem('token', token);

    service.getResultsByUser.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.ngOnInit();
    tick();

    expect(component.results).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('Error al obtener los resultados del usuario.');
  }));

  // ---------------- Modal lógica
  it('should open and close modal', () => {
    const result = { analysisName: 'Hemograma', labName: 'Lab1' };

    component.openModal(result);
    expect(component.selectedResult).toBe(result);

    component.closeModal();
    expect(component.selectedResult).toBeNull();
  });

  // =====================================================
  // TEMPLATE BRANCHES (SIN reconfigurar TestBed)
  // =====================================================
  describe('Template Branches', () => {

    it('should show loading message when loading is true', () => {
      spyOn(ResultsComponent.prototype, 'ngOnInit').and.stub();

      fixture = TestBed.createComponent(ResultsComponent);
      component = fixture.componentInstance;

      component.loading = true;
      component.errorMsg = '';
      component.results = [];

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cargando...');
    });


    it('should show table if results exist', () => {
      component.loading = false;
      component.results = [
        { analysisName: 'Hemograma', labName: 'Lab1', resultValue: 123, resultDate: '2025-12-11' }
      ];
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
      expect(table.textContent).toContain('Hemograma');
      expect(table.textContent).toContain('Lab1');
    });

    it('should show "No hay resultados disponibles" if results empty', () => {
      component.loading = false;
      component.results = [];
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .toContain('No hay resultados disponibles');
    });

    it('should render modal if selectedResult is set', () => {
      component.selectedResult = {
        analysisName: 'Hemograma',
        labName: 'Lab1',
        resultValue: 123,
        resultDetails: 'Normal',
        resultDate: '2025-12-11'
      };
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('.fixed.inset-0');
      expect(modal).toBeTruthy();
      expect(modal.textContent).toContain('Detalle del Examen');
      expect(modal.textContent).toContain('Hemograma');
      expect(modal.textContent).toContain('Normal');
    });

    it('should not render modal if selectedResult is null', () => {
      component.selectedResult = null;
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('.fixed.inset-0')
      ).toBeNull();
    });
  });
});
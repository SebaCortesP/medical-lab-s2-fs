import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabsComponent } from './labs';
import { LabsService, Lab } from '../../services/labs.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Mock de LabsService
class LabsServiceMock {
  getLabs = jasmine.createSpy('getLabs').and.returnValue(of({ data: [] }));
  createLab = jasmine.createSpy('createLab').and.returnValue(of({}));
  updateLab = jasmine.createSpy('updateLab').and.returnValue(of({}));
  deleteLab = jasmine.createSpy('deleteLab').and.returnValue(of({}));
}

describe('LabsComponent', () => {
  let component: LabsComponent;
  let fixture: ComponentFixture<LabsComponent>;
  let labsService: LabsServiceMock;

  beforeEach(async () => {
    labsService = new LabsServiceMock();

    await TestBed.configureTestingModule({
      imports: [LabsComponent, CommonModule, FormsModule],
      providers: [{ provide: LabsService, useValue: labsService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ----------------------------
  // GENERAL
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ----------------------------
  // LOAD LABS
  it('should load labs on init', () => {
    const labsMock: Lab[] = [
      { id: 1, name: 'Lab A', address: 'Dirección A', phone: '123' }
    ];
    labsService.getLabs.and.returnValue(of({ data: labsMock }));

    component.ngOnInit();

    expect(labsService.getLabs).toHaveBeenCalled();
    expect(component.labs.length).toBe(1);
    expect(component.labs[0].name).toBe('Lab A');
  });

  it('should set error message if loadLabs fails', () => {
    labsService.getLabs.and.returnValue(throwError(() => new Error('Error')));

    component.loadLabs();

    expect(component.errorMsg).toBe('Error cargando los laboratorios');
  });

  // ----------------------------
  // CREATE LAB
  it('should create lab successfully', () => {
    component.newLab = { name: 'Nuevo', address: 'Dir nueva', phone: '999' };
    const labToCreate = { ...component.newLab };
    labsService.getLabs.and.returnValue(of({ data: [] }));

    component.createLab();

    expect(labsService.createLab).toHaveBeenCalledWith(labToCreate);
    expect(component.successMsg).toBe('Laboratorio creado');
    expect(component.newLab).toEqual({ name: '', address: '', phone: '' });
    expect(labsService.getLabs).toHaveBeenCalled();
  });

  it('should set error message if createLab fails', () => {
    labsService.createLab.and.returnValue(throwError(() => new Error('fail')));
    component.createLab();
    expect(component.errorMsg).toBe('No se pudo crear el laboratorio');
  });

  // ----------------------------
  // EDIT LAB
  it('should set selectedLab when editLab is called', () => {
    const lab: Lab = { id: 1, name: 'Test', address: 'Addr', phone: '123' };
    component.editLab(lab);
    expect(component.selectedLab).toEqual(lab);
  });

  // ----------------------------
  // UPDATE LAB
  it('should update lab successfully', () => {
    const lab: Lab = { id: 5, name: 'Edit', address: 'Dir', phone: '123' };
    component.selectedLab = { ...lab };
    labsService.getLabs.and.returnValue(of({ data: [] }));

    component.updateLab();

    expect(labsService.updateLab).toHaveBeenCalledWith(5, lab);
    expect(component.successMsg).toBe('Laboratorio actualizado');
    expect(component.selectedLab).toBeNull();
  });

  it('should NOT update lab if selectedLab has no id', () => {
    component.selectedLab = { name: 'X', address: 'Y', phone: 'Z' };
    component.updateLab();
    expect(labsService.updateLab).not.toHaveBeenCalled();
  });

  it('should set error message if update fails', () => {
    const lab: Lab = { id: 10, name: 'A', address: 'B', phone: 'C' };
    component.selectedLab = lab;
    labsService.updateLab.and.returnValue(throwError(() => new Error('fail')));
    component.updateLab();
    expect(component.errorMsg).toBe('No se pudo actualizar');
  });

  // ----------------------------
  // DELETE LAB
  it('should delete lab successfully', () => {
    labsService.getLabs.and.returnValue(of({ data: [] }));
    component.deleteLab(10);
    expect(labsService.deleteLab).toHaveBeenCalledWith(10);
    expect(labsService.getLabs).toHaveBeenCalled();
  });

  it('should set error message if delete fails', () => {
    labsService.deleteLab.and.returnValue(throwError(() => new Error('fail')));
    component.deleteLab(99);
    expect(component.errorMsg).toBe('Error eliminando');
  });

  // ----------------------------
  // TEMPLATE / BRANCHES
  describe('Template Branches', () => {
    beforeEach(() => {
      component.errorMsg = '';
      component.successMsg = '';
      component.selectedLab = null;
      component.labs = [];
      fixture.detectChanges();
    });

    it('should not render errorMsg or successMsg if empty', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.text-red-500')).toBeNull();
      expect(compiled.querySelector('.text-green-500')).toBeNull();
    });

    it('should render errorMsg if set', () => {
      component.errorMsg = 'Error cargando laboratorios';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const errorEl = compiled.querySelector('.text-red-500');
      expect(errorEl).toBeTruthy();
      expect(errorEl?.textContent).toContain('Error cargando laboratorios');
    });

    it('should render successMsg if set', () => {
      component.successMsg = 'Laboratorio creado';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const successEl = compiled.querySelector('.text-green-500');
      expect(successEl).toBeTruthy();
      expect(successEl?.textContent).toContain('Laboratorio creado');
    });

    it('should not render modal if selectedLab is null', () => {
      component.selectedLab = null;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.fixed.inset-0')).toBeNull();
    });

    it('should render modal if selectedLab is set', () => {
      component.selectedLab = { id: 1, name: 'Lab 1', address: 'Addr', phone: '123' };
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.fixed.inset-0')).toBeTruthy();
    });

    it('should render empty table if labs is empty', () => {
      component.labs = [];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const rows = compiled.querySelectorAll('tbody tr');
      expect(rows.length).toBe(0);
    });

    it('should render table rows if labs exist', () => {
      component.labs = [
        { id: 1, name: 'Lab A', address: 'Addr A', phone: '123' },
        { id: 2, name: 'Lab B', address: 'Addr B', phone: '456' }
      ];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const rows = compiled.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('Lab A');
      expect(rows[1].textContent).toContain('Lab B');
    });
  });
});

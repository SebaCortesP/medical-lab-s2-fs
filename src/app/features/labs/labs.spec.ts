import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabsComponent } from './labs';
import { LabsService, Lab } from '../../services/labs.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
      imports: [
        LabsComponent, // Standalone component
        CommonModule,
        FormsModule
      ],
      providers: [
        { provide: LabsService, useValue: labsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ----------------------------------------------------------------
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // CREATE LAB
  it('should create lab successfully', () => {
    // Asignamos los valores al formulario de nuevo laboratorio
    component.newLab = { name: 'Nuevo', address: 'Dir nueva', phone: '999' };

    // Creamos una copia para comparar con el spy, antes de que el método reseteé newLab
    const labToCreate = { ...component.newLab };

    // Simulamos que getLabs se llamará después del create
    labsService.getLabs.and.returnValue(of({ data: [] }));

    // Llamamos al método del componente
    component.createLab();

    // Verificamos que el servicio se haya llamado con los datos correctos
    expect(labsService.createLab).toHaveBeenCalledWith(labToCreate);

    // Verificamos mensajes de éxito y reset del formulario
    expect(component.successMsg).toBe('Laboratorio creado');
    expect(component.newLab).toEqual({ name: '', address: '', phone: '' });

    // Verificamos que se haya recargado la lista de laboratorios
    expect(labsService.getLabs).toHaveBeenCalled();
  });


  it('should set error message if createLab fails', () => {
    labsService.createLab.and.returnValue(throwError(() => new Error('fail')));

    component.createLab();

    expect(component.errorMsg).toBe('No se pudo crear el laboratorio');
  });

  // ----------------------------------------------------------------
  // EDIT LAB
  it('should set selectedLab when editLab is called', () => {
    const lab: Lab = { id: 1, name: 'Test', address: 'Addr', phone: '123' };

    component.editLab(lab);

    expect(component.selectedLab).toEqual(lab);
  });

  // ----------------------------------------------------------------
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
    component.selectedLab = { name: 'X', address: 'Y', phone: 'Z' }; // sin ID

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

  // ----------------------------------------------------------------
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
});

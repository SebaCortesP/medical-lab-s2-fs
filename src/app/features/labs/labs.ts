import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabsService, Lab } from '../../services/labs.service';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labs.html',
  styleUrl: './labs.scss',
})
export class LabsComponent implements OnInit {

  labs: Lab[] = [];
  newLab: Lab = { name: '', address: '', phone: '' };
  selectedLab: Lab | null = null;
  errorMsg = '';
  successMsg = '';

  constructor(private readonly labsService: LabsService) {}

  ngOnInit(): void {
    this.loadLabs();
  }

loadLabs() {
  this.labsService.getLabs().subscribe({
    next: resp => {
      console.log("Respuesta backend:", resp);
      this.labs = resp.data;
    },
    error: () => this.errorMsg = 'Error cargando los laboratorios'
  });
}


  createLab() {
    this.labsService.createLab(this.newLab).subscribe({
      next: () => {
        this.successMsg = 'Laboratorio creado';
        this.newLab = { name: '', address: '', phone: '' };
        this.loadLabs();
      },
      error: () => this.errorMsg = 'No se pudo crear el laboratorio'
    });
  }

  editLab(lab: Lab) {
    this.selectedLab = { ...lab };
  }

  updateLab() {
    if (!this.selectedLab?.id) return;

    this.labsService.updateLab(this.selectedLab.id, this.selectedLab).subscribe({
      next: () => {
        this.successMsg = 'Laboratorio actualizado';
        this.selectedLab = null;
        this.loadLabs();
      },
      error: () => this.errorMsg = 'No se pudo actualizar'
    });
  }

  deleteLab(id: number) {
    this.labsService.deleteLab(id).subscribe({
      next: () => this.loadLabs(),
      error: () => this.errorMsg = 'Error eliminando'
    });
  }
}

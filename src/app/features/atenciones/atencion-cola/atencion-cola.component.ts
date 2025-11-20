import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { IAtencion } from '../../../core/models/models';

@Component({
  selector: 'app-atencion-cola',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atencion-cola.component.html',
  styleUrl: './atencion-cola.component.css'
})
export class AtencionColaComponent implements OnInit, OnDestroy {
  cola = signal<IAtencion[]>([]);
  private intervalId: any;
  lastUpdated = new Date();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCola();
    // Poll every 30 seconds
    this.intervalId = setInterval(() => {
      this.loadCola();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadCola() {
    // Hardcoded sucursal ID 1 for now as per instructions context
    this.apiService.get<IAtencion[]>('/atenciones/cola/1').subscribe({
      next: (response: any) => {
        if (response.exito && response.datos) {
          this.cola.set(response.datos);
          this.lastUpdated = new Date();
        }
      },
      error: (err) => console.error('Error loading queue', err)
    });
  }
}

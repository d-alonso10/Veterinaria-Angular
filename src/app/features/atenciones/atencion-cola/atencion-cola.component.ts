import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
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
  private destroy$ = new Subject<void>();
  lastUpdated = new Date();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.apiService.get<IAtencion[]>('/atenciones/cola/1')),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response.exito && response.datos) {
            this.cola.set(response.datos);
            this.lastUpdated = new Date();
          }
        },
        error: (err) => console.error('Error loading queue', err)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

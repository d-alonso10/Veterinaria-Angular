import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttentionService } from '../../../core/services/attention.service';
import { IAtencion } from '../../../core/models/models';

@Component({
  selector: 'app-atencion-cola',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './atencion-cola.component.html',
  styleUrl: './atencion-cola.component.css'
})
export class AtencionColaComponent implements OnInit, OnDestroy {
  cola = signal<IAtencion[]>([]);
  private destroy$ = new Subject<void>();
  lastUpdated = new Date();

  constructor(private attentionService: AttentionService) {}

  ngOnInit() {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.attentionService.getCola(1)), // Hardcoded sucursal 1
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.cola.set(data);
          this.lastUpdated = new Date();
        },
        error: (err) => console.error('Error loading queue', err)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


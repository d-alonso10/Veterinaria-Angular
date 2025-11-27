import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  currentDate = new Date();
  user;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUser;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

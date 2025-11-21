import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('medical-lab');
  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.loadUserFromToken();
  }
}

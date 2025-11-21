import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HomeComponent } from './features/home/home';
import { AuthGuard } from './core/auth-guard';
import { LoggedLayoutComponent } from './layouts/logged-layout/logged-layout';
import { ResultsComponent } from './features/results/results/results';
import { AnalysisManagementComponent } from './features/analysis/analysis/analysis';
import { LabsComponent } from './features/labs/labs';

// exportamos la constante para poder usarla en app.config.ts
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LoggedLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      // { path: 'profile', component: ProfileComponent },
      { path: 'reservas', component: ResultsComponent },
      { path: 'analyses', component: AnalysisManagementComponent },
      { path: 'labs', component: LabsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/jwt-interceptor';
import { ConfigService } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule),

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },

    // <-- APP_INITIALIZER para cargar config antes de bootstrap
    {
      provide: APP_INITIALIZER,
      useFactory: (cfg: ConfigService) => () => cfg.loadConfig(),
      deps: [ConfigService],
      multi: true
    }
  ]
};

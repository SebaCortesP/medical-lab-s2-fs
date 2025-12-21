// config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ConfigService {
    private config: any;

    constructor(private readonly http: HttpClient) { }

    loadConfig(): Promise<void> {
        return this.http.get('/config.json')
            .toPromise()
            .then(cfg => {
                this.config = cfg;
                return; 
            });
    }

    get apiA() { return this.config?.apiA; }
    get apiB() { return this.config?.apiB; }
    get apiC() { return this.config?.apiC; }
}

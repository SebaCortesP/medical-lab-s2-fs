import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });

    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loadConfig should fetch and assign config', async () => {
    const mockConfig = { apiA: 'https://api-a.test', apiB: 'https://api-b.test' };

    const promise = service.loadConfig();

    const req = httpMock.expectOne('/config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);

    await promise;

    expect(service.apiA).toBe(mockConfig.apiA);
    expect(service.apiB).toBe(mockConfig.apiB);
  });

  it('apiA and apiB getters should return undefined if config not loaded', () => {
    expect(service.apiA).toBeUndefined();
    expect(service.apiB).toBeUndefined();
  });
});

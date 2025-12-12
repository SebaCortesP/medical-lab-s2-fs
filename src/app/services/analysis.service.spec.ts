import { TestBed } from '@angular/core/testing';
import { AnalysisService } from './analysis.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let httpMock: HttpTestingController;
  let configMock: Partial<ConfigService>;

  beforeEach(() => {
    configMock = {
      apiB: 'https://api-b.test'
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnalysisService,
        { provide: ConfigService, useValue: configMock }
      ]
    });

    service = TestBed.inject(AnalysisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPacientByUserId should call correct URL', () => {
    const userId = 123;
    const dummyResponse = { id: userId, name: 'Juan' };

    service.getPacientByUserId(userId).subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/pacients/by-user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });

  it('getResultsByUser should call correct URL', () => {
    const userId = 456;
    const dummyResponse = { data: [{ id: 1, resultValue: '350' }] };

    service.getResultsByUser(userId).subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/results/by-user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AnalysisManagementService } from './analysis-management.service';
import { ConfigService } from './config.service';

describe('AnalysisManagementService', () => {
  let service: AnalysisManagementService;
  let httpMock: HttpTestingController;

  const configMock: ConfigService = {
    apiB: 'https://api-b.test',
    apiA: 'https://api-a.test'
  } as ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnalysisManagementService,
        { provide: ConfigService, useValue: configMock }
      ]
    });

    service = TestBed.inject(AnalysisManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ---------------------------------------
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------
  it('getAnalyses should return data array', () => {
    const dummyResponse = {
      data: [{ id: 1, name: 'Hemograma' }]
    };

    service.getAnalyses().subscribe(res => {
      expect(res).toEqual(dummyResponse.data);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/analyses`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });

  // ---------------------------------------
  it('createAnalysis should POST data', () => {
    const payload = {
      name: 'Hemograma',
      price: 10000,
      durationMinutes: 30,
      labId: 1
    };

    service.createAnalysis(payload).subscribe(res => {
      expect(res).toEqual(payload);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/analyses`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  // ---------------------------------------
  it('createResult should POST data', () => {
    const payload = {
      pacientId: 1,
      analysisId: 1,
      labId: 1,
      resultValue: '350',
      resultDetails: 'OK',
      resultDate: '2025-12-11'
    };

    service.createResult(payload).subscribe(res => {
      expect(res).toEqual(payload);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/results`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  // ---------------------------------------
  it('getLabs should return labs array', () => {
    const dummyResponse = {
      data: [{ id: 1, name: 'Lab 1' }]
    };

    service.getLabs().subscribe(res => {
      expect(res).toEqual(dummyResponse.data);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/labs`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });

  // ---------------------------------------
  it('getPacientes should return pacientes array', () => {
    const dummyResponse = {
      data: [{ id: 1, name: 'Juan', lastname: 'Perez' }]
    };

    service.getPacientes().subscribe(res => {
      expect(res).toEqual(dummyResponse.data);
    });

    const req = httpMock.expectOne(
      `${configMock.apiA}/pacients`
    );
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });
});

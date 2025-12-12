import { TestBed } from '@angular/core/testing';
import { LabsService, Lab, ApiResponse } from './labs.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('LabsService', () => {
  let service: LabsService;
  let httpMock: HttpTestingController;
  let configMock: Partial<ConfigService>;

  beforeEach(() => {
    configMock = {
      apiB: 'https://api-b.test'
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LabsService,
        { provide: ConfigService, useValue: configMock }
      ]
    });

    service = TestBed.inject(LabsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createLab should POST to correct URL', () => {
    const lab: Lab = { name: 'Lab 1', address: 'Calle 123', phone: '123456789' };

    service.createLab(lab).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${configMock.apiB}/labs`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('getLabs should GET all labs', () => {
    const dummyResponse: ApiResponse<Lab[]> = { success: true, message: 'ok', data: [{ name: 'Lab 1', address: 'Calle 123', phone: '123456789' }] };

    service.getLabs().subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/labs`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });

  it('getLabById should GET lab by ID', () => {
    const lab: Lab = { name: 'Lab 1', address: 'Calle 123', phone: '123456789' };
    const id = 1;

    service.getLabById(id).subscribe(res => {
      expect(res).toEqual(lab);
    });

    const req = httpMock.expectOne(`${configMock.apiB}/labs/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(lab);
  });

  it('updateLab should PUT to correct URL', () => {
    const lab: Lab = { name: 'Lab 1', address: 'Calle 123', phone: '123456789' };
    const id = 1;

    service.updateLab(id, lab).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${configMock.apiB}/labs/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true });
  });

  it('deleteLab should DELETE to correct URL', () => {
    const id = 1;

    service.deleteLab(id).subscribe(res => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${configMock.apiB}/labs/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});

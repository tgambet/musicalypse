import { TestBed, inject } from '@angular/core/testing';

import { PersistenceService } from './persistence.service';

describe('PersistenceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersistenceService]
    });
  });

  it('should be created', inject([PersistenceService], (service: PersistenceService) => {
    expect(service).toBeTruthy();
  }));
});

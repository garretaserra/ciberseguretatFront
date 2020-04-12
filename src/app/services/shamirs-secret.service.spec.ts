import { TestBed } from '@angular/core/testing';

import { ShamirsSecretService } from './shamirs-secret.service';

describe('ShamirsSecretService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShamirsSecretService = TestBed.get(ShamirsSecretService);
    expect(service).toBeTruthy();
  });
});

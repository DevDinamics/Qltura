import { TestBed } from '@angular/core/testing';

import { Comunicados } from './comunicados';

describe('Comunicados', () => {
  let service: Comunicados;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Comunicados);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

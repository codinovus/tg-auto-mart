import { Test, TestingModule } from '@nestjs/testing';
import { ProductKeyService } from './product-key.service';

describe('ProductKeyService', () => {
  let service: ProductKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductKeyService],
    }).compile();

    service = module.get<ProductKeyService>(ProductKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

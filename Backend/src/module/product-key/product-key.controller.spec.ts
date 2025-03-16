import { Test, TestingModule } from '@nestjs/testing';
import { ProductKeyController } from './product-key.controller';

describe('ProductKeyController', () => {
  let controller: ProductKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductKeyController],
    }).compile();

    controller = module.get<ProductKeyController>(ProductKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

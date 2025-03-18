import { Test, TestingModule } from '@nestjs/testing';
import { DepositRequestController } from './deposit-request.controller';

describe('DepositRequestController', () => {
  let controller: DepositRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositRequestController],
    }).compile();

    controller = module.get<DepositRequestController>(DepositRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DepositRequestService } from './deposit-request.service';

describe('DepositRequestService', () => {
  let service: DepositRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositRequestService],
    }).compile();

    service = module.get<DepositRequestService>(DepositRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

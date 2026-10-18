import { Test, TestingModule } from '@nestjs/testing';
import { TinyFishService } from './tinyfish.service';
import { TinyFishClient } from './tinyfish.client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('TinyFishService', () => {
  let service: TinyFishService;
  let client: TinyFishClient;
  let prisma: PrismaService;

  const mockStartup = {
    id: 'startup-123',
    companyName: 'KiranaPay',
    sector: 'Fintech',
    stage: 'SEED',
    city: 'Bengaluru',
    state: 'Karnataka',
    foundedYear: 2022,
    website: 'https://kiranapay.in',
    cin: 'U72900KA2022PTC159842',
    dpiitNumber: '128492',
    fundingAsk: BigInt(2500000000), // ₹2.5 Cr in paise
    growthRateMom: 24.5,
    verificationStatus: 'UNDER_REVIEW',
    teamMembers: [{ name: 'Rahul Sharma', role: 'Founder & CEO' }],
    tractionHistory: [],
    tinyfishReports: [],
    user: { name: 'Rahul Sharma', email: 'rahul@kiranapay.in' },
  };

  const mockPrismaService = {
    startup: {
      findUnique: jest.fn().mockResolvedValue(mockStartup),
    },
    tinyFishReport: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'report-999',
          createdAt: new Date(),
          ...data,
        }),
      ),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TinyFishService,
        TinyFishClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal: any) => defaultVal),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TinyFishService>(TinyFishService);
    client = module.get<TinyFishClient>(TinyFishClient);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined and return health check status', () => {
    expect(service).toBeDefined();
    const health = service.getHealth();
    expect(health.status).toBe('UP');
    expect(health.engine).toContain('TinyFish');
    expect(health.capabilities.length).toBeGreaterThan(0);
  });

  it('should execute live/simulated web search', async () => {
    const results = await service.search('KiranaPay India Fintech');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBeDefined();
    expect(results[0].url).toBeDefined();
  });

  it('should fetch and extract web page markdown', async () => {
    const results = await service.fetchUrls(['https://kiranapay.in']);
    expect(results).toBeDefined();
    expect(results.length).toBe(1);
    expect(results[0].content.toUpperCase()).toContain('KIRANAPAY');
  });

  it('should run autonomous agent', async () => {
    const res = await service.runAgent('https://kiranapay.in', 'Verify company status');
    expect(res).toBeDefined();
    expect(res.status).toBe('COMPLETED');
    expect(res.steps?.length).toBeGreaterThan(0);
  });

  it('should auto-enrich startup parameters from website URL', async () => {
    const enriched = await service.enrichFromUrl('https://kiranapay.in');
    expect(enriched).toBeDefined();
    expect(enriched.companyName).toBeDefined();
    expect(enriched.tagline).toBeDefined();
    expect(enriched.suggestedTags.length).toBeGreaterThan(0);
    expect(enriched.detectedCompetitors.length).toBeGreaterThan(0);
  });

  it('should generate comprehensive due diligence report for startup', async () => {
    const report = await service.getOrGenerateDueDiligence('startup-123', true);
    expect(report).toBeDefined();
    expect(report.startupId).toBe('startup-123');
    expect(report.companyName).toBe('KiranaPay');
    expect(report.overallScore).toBeGreaterThanOrEqual(70);
    expect(report.competitors.length).toBeGreaterThan(0);
    expect(report.newsCitations.length).toBeGreaterThan(0);
    expect(report.mcaRegistryStatus).toContain('ACTIVE');
    expect(mockPrismaService.tinyFishReport.create).toHaveBeenCalled();
  });

  it('should run admin verification compliance agent', async () => {
    const verification = await service.runAdminVerificationAgent('startup-123');
    expect(verification).toBeDefined();
    expect(verification.recommendation).toBe('APPROVE');
    expect(verification.confidenceScore).toBeGreaterThanOrEqual(80);
    expect(verification.cinStatus.verified).toBe(true);
    expect(verification.dpiitStatus.verified).toBe(true);
    expect(verification.auditTrail.length).toBe(4);
  });

  it('should answer interactive due diligence query via agent copilot', async () => {
    const response = await service.askAgent('startup-123', 'Does this startup have NBFC status?');
    expect(response).toBeDefined();
    expect(response.answer).toBeDefined();
    expect(response.confidence).toBeGreaterThan(80);
    expect(response.sources.length).toBeGreaterThan(0);
  });
});

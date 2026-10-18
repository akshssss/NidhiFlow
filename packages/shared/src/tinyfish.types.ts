export interface TinyFishCitation {
  title: string;
  url: string;
  snippet?: string;
  publishedDate?: string;
  source?: string;
}

export interface TinyFishWebSignal {
  domain: string;
  isOnline: boolean;
  sslSecure: boolean;
  serverLocation?: string;
  techStack: string[];
  trafficEstimate?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface TinyFishCompetitor {
  name: string;
  website?: string;
  stage: string;
  valuationOrFunding?: string;
  keyDifferentiator: string;
  threatLevel: 'Low' | 'Medium' | 'High';
}

export interface TinyFishRiskIndicator {
  type: 'LEGAL' | 'REGULATORY' | 'REPUTATION' | 'FINANCIAL' | 'OPERATIONAL';
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  detectedAt: string;
  sourceUrl?: string;
}

export interface TinyFishVerificationAgentResult {
  startupId: string;
  companyName: string;
  timestamp: string;
  recommendation: 'APPROVE' | 'REVIEW_REQUIRED' | 'REJECT';
  confidenceScore: number; // 0 - 100
  cinStatus: {
    provided: string | null;
    verified: boolean;
    companyStatus: string;
    rocCode?: string;
    incorporationDate?: string;
  };
  dpiitStatus: {
    provided: string | null;
    verified: boolean;
    certificateValid: boolean;
  };
  webPresence: {
    websiteLive: boolean;
    domainMatchesEntity: boolean;
    founderProfilesFound: boolean;
  };
  negativeNewsFound: boolean;
  negativeNewsSummary?: string;
  auditTrail: {
    step: string;
    action: string;
    result: string;
    durationMs: number;
  }[];
}

export interface TinyFishDueDiligenceReport {
  id?: string;
  startupId: string;
  companyName: string;
  overallScore: number;
  trustLevel: 'ELITE' | 'HIGH' | 'MODERATE' | 'CAUTION';
  summary: string;
  mcaRegistryStatus: string;
  dpiitRecognitionStatus: string;
  webSignals: TinyFishWebSignal;
  newsCitations: TinyFishCitation[];
  competitors: TinyFishCompetitor[];
  risks: TinyFishRiskIndicator[];
  growthHighlights: string[];
  rawAnalysis?: any;
  updatedAt: string;
}

export interface TinyFishEnrichmentResult {
  companyName?: string;
  tagline?: string;
  description?: string;
  sector?: string;
  targetMarket?: string;
  businessModel?: string;
  problemStatement?: string;
  solution?: string;
  suggestedTags: string[];
  detectedCompetitors: string[];
}

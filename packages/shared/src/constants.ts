// ── Enums ──

export enum UserRole {
  STARTUP = 'STARTUP',
  INVESTOR = 'INVESTOR',
  ADMIN = 'ADMIN',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum StartupStage {
  IDEA = 'IDEA',
  MVP = 'MVP',
  PRE_SEED = 'PRE_SEED',
  SEED = 'SEED',
  SERIES_A = 'SERIES_A',
  SERIES_B_PLUS = 'SERIES_B_PLUS',
}

export enum InvestorType {
  ANGEL = 'ANGEL',
  VC = 'VC',
  FAMILY_OFFICE = 'FAMILY_OFFICE',
  HNI = 'HNI',
  CORPORATE = 'CORPORATE',
}

export enum InterestStatus {
  EXPRESSED = 'EXPRESSED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMMITTED = 'COMMITTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum NotificationType {
  INTEREST_RECEIVED = 'INTEREST_RECEIVED',
  INTEREST_ACCEPTED = 'INTEREST_ACCEPTED',
  INTEREST_DECLINED = 'INTEREST_DECLINED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  VERIFICATION_UPDATE = 'VERIFICATION_UPDATE',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  LEADERBOARD_CHANGE = 'LEADERBOARD_CHANGE',
}

// ── Sectors ──

export const SECTORS = [
  'Fintech',
  'Healthtech',
  'Edtech',
  'SaaS',
  'E-commerce',
  'Agritech',
  'Cleantech',
  'Deeptech',
  'D2C',
  'Logistics',
  'Media & Entertainment',
  'Gaming',
  'Proptech',
  'Legaltech',
  'HRtech',
  'Insurtech',
  'Biotech',
  'Spacetech',
  'EV & Mobility',
  'Social Impact',
  'AI/ML',
  'Web3 & Blockchain',
  'Cybersecurity',
  'Other',
] as const;

export type Sector = (typeof SECTORS)[number];

// ── Indian States ──

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

// ── Badges ──

export const BADGES = {
  VERIFIED_STARTUP: { label: 'Verified Startup', color: '#16a34a' },
  DPIIT_RECOGNISED: { label: 'DPIIT Recognised', color: '#ea580c' },
  VERIFIED_INVESTOR: { label: 'Verified Investor', color: '#2563eb' },
  SEBI_REGISTERED: { label: 'SEBI Registered', color: '#7c3aed' },
} as const;

// ── Scoring weights ──

export const SCORING_WEIGHTS = {
  TRACTION: 0.25,
  GROWTH: 0.20,
  PROFILE_COMPLETENESS: 0.15,
  INVESTOR_INTEREST: 0.15,
  UPDATE_CONSISTENCY: 0.10,
  TRANSPARENCY_RATING: 0.10,
  FUNDS_RAISED: 0.05,
} as const;

// ── Review dimensions ──

export const REVIEW_DIMENSIONS = [
  'responsiveness',
  'transparency',
  'founderFriendliness',
  'valueAdd',
  'followThrough',
  'decisionSpeed',
] as const;

export type ReviewDimension = (typeof REVIEW_DIMENSIONS)[number];

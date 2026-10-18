import { z } from 'zod';

// ── Indian document format validators ──

/** CIN: 21 chars, e.g. U72200MH2019PTC123456 */
export const cinSchema = z
  .string()
  .regex(
    /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/,
    'Invalid CIN format. Expected: U72200MH2019PTC123456'
  );

/** LLPIN: e.g. AAA-1234 */
export const llpinSchema = z
  .string()
  .regex(/^[A-Z]{3}-\d{4}$/, 'Invalid LLPIN format. Expected: AAA-1234');

/** PAN: 10 chars, e.g. ABCDE1234F */
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Invalid PAN format. Expected: ABCDE1234F');

/** GSTIN: 15 chars, e.g. 27AAPFU0939F1ZV */
export const gstinSchema = z
  .string()
  .regex(
    /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/,
    'Invalid GSTIN format. Expected: 27AAPFU0939F1ZV'
  );

/** DPIIT recognition number */
export const dpiitSchema = z
  .string()
  .regex(
    /^DIPP\d{4,8}$/,
    'Invalid DPIIT number format. Expected: DIPP followed by 4-8 digits'
  );

/** SEBI registration: e.g. INB010000001 or IN/AIF2/12-34/5678 */
export const sebiRegSchema = z
  .string()
  .min(6, 'SEBI registration number too short')
  .max(30, 'SEBI registration number too long');

/** Aadhaar: 12 digits */
export const aadhaarSchema = z
  .string()
  .regex(/^\d{12}$/, 'Invalid Aadhaar number. Must be 12 digits');

// ── Auth schemas ──

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Startup profile schema ──

export const startupProfileSchema = z.object({
  companyName: z.string().min(2).max(150),
  tagline: z.string().max(200).optional(),
  sector: z.string().min(1),
  stage: z.enum(['IDEA', 'MVP', 'PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B_PLUS']),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  teamSize: z.number().int().min(1).max(10000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  description: z.string().max(5000).optional(),
  problemStatement: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  targetMarket: z.string().max(1000).optional(),
  businessModel: z.string().max(1000).optional(),
  mrr: z.number().int().min(0).optional(),
  totalUsers: z.number().int().min(0).optional(),
  growthRateMom: z.number().min(-100).max(1000).optional(),
  fundingAsk: z.number().int().min(0).optional(),
  equityOffered: z.number().min(0).max(100).optional(),
  useOfFunds: z.string().max(2000).optional(),
  demoVideoUrl: z.string().url().optional().or(z.literal('')),
});

// ── Investor profile schema ──

export const investorProfileSchema = z.object({
  displayName: z.string().min(2).max(150),
  type: z.enum(['ANGEL', 'VC', 'FAMILY_OFFICE', 'HNI', 'CORPORATE']),
  firmName: z.string().max(150).optional(),
  bio: z.string().max(3000).optional(),
  thesis: z.string().max(2000).optional(),
  sectors: z.array(z.string()).min(1).max(10),
  stagePreference: z.array(z.string()).min(1),
  ticketSizeMin: z.number().int().min(0),
  ticketSizeMax: z.number().int().min(0),
  geographyPreference: z.array(z.string()).optional(),
  pastInvestments: z.string().max(3000).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

// ── Review schema ──

export const reviewSchema = z.object({
  interestId: z.string().uuid(),
  responsiveness: z.number().int().min(1).max(5),
  transparency: z.number().int().min(1).max(5),
  founderFriendliness: z.number().int().min(1).max(5),
  valueAdd: z.number().int().min(1).max(5),
  followThrough: z.number().int().min(1).max(5),
  decisionSpeed: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000),
});

// ── Interest schema ──

export const expressInterestSchema = z.object({
  startupId: z.string().uuid(),
  ticketAmount: z.number().int().min(100000, 'Minimum ₹1,00,000'),
  message: z.string().max(1000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StartupProfileInput = z.infer<typeof startupProfileSchema>;
export type InvestorProfileInput = z.infer<typeof investorProfileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ExpressInterestInput = z.infer<typeof expressInterestSchema>;

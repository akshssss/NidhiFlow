import { PrismaClient, UserRole, VerificationStatus, StartupStage, InvestorType, InterestStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NidhiFlow database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoomMember.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.savedStartup.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.document.deleteMany();
  await prisma.tractionSnapshot.deleteMany();
  await prisma.startupUpdate.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('Test@1234');

  // ── Admin user ──
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nidhiflow.in',
      passwordHash,
      name: 'NidhiFlow Admin',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created');

  // ── Startup founders ──
  const startupData = [
    { email: 'rahul@kiranapay.in', name: 'Rahul Sharma', company: 'KiranaPay', tagline: 'UPI payments for kirana stores', sector: 'Fintech', stage: StartupStage.SEED, city: 'Mumbai', state: 'Maharashtra', founded: 2022, mrr: 850000_00, users: 12400, growth: 28, ask: 5_00_00_000_00, equity: 8, description: 'KiranaPay simplifies digital payments for over 12 million kirana stores across India. Our POS-free solution works with any UPI app and provides working capital loans based on transaction data.', cin: 'U72200MH2022PTC384521', pan: 'AABCK1234F', dpiit: 'DIPP12345', verified: true },
    { email: 'priya@medisync.health', name: 'Priya Patel', company: 'MediSync', tagline: 'AI-powered diagnostic reports for Tier-2 clinics', sector: 'Healthtech', stage: StartupStage.PRE_SEED, city: 'Ahmedabad', state: 'Gujarat', founded: 2023, mrr: 120000_00, users: 340, growth: 45, ask: 2_00_00_000_00, equity: 12, description: 'MediSync uses computer vision to analyse X-rays and blood reports, giving Tier-2 and Tier-3 city clinics access to specialist-grade diagnostics at 1/10th the cost.', cin: 'U85100GJ2023PTC401234', pan: 'AABCM5678G', verified: true },
    { email: 'arjun@farmlink.co', name: 'Arjun Reddy', company: 'FarmLink', tagline: 'Direct farm-to-restaurant supply chain', sector: 'Agritech', stage: StartupStage.MVP, city: 'Hyderabad', state: 'Telangana', founded: 2023, mrr: 45000_00, users: 890, growth: 62, ask: 1_50_00_000_00, equity: 15, description: 'FarmLink eliminates middlemen by connecting 2,000+ farmers directly with restaurants and cloud kitchens in Hyderabad. We handle cold chain logistics, quality grading, and payments.', cin: 'U01400TS2023PTC178456', pan: 'AABCF9012H', verified: true },
    { email: 'sneha@learnbharat.edu', name: 'Sneha Iyer', company: 'LearnBharat', tagline: 'Vernacular skill training for blue-collar workers', sector: 'Edtech', stage: StartupStage.SEED, city: 'Bengaluru', state: 'Karnataka', founded: 2021, mrr: 380000_00, users: 45000, growth: 18, ask: 8_00_00_000_00, equity: 6, description: 'LearnBharat delivers skill certification courses in 8 Indian languages. Our mobile-first platform has trained 45,000 workers in logistics, hospitality, and retail with a 73% placement rate.', cin: 'U80900KA2021PTC145678', pan: 'AABCL3456J', dpiit: 'DIPP23456', verified: true },
    { email: 'vikram@evcharge.in', name: 'Vikram Singh', company: 'ChargeKaro', tagline: 'EV charging infra for Tier-2 cities', sector: 'EV & Mobility', stage: StartupStage.SERIES_A, city: 'Jaipur', state: 'Rajasthan', founded: 2021, mrr: 2200000_00, users: 8900, growth: 35, ask: 25_00_00_000_00, equity: 5, description: 'ChargeKaro operates 450+ EV charging stations across 12 Tier-2 cities in Rajasthan, MP, and Gujarat. We partner with petrol pumps and malls for rapid deployment with 98.5% uptime.', cin: 'U40100RJ2021PTC198765', pan: 'AABCC7890K', dpiit: 'DIPP34567', gstin: '08AABCC7890K1Z5', verified: true },
    { email: 'meera@closetloop.com', name: 'Meera Krishnan', company: 'ClosetLoop', tagline: 'Circular fashion marketplace for Indian brands', sector: 'D2C', stage: StartupStage.PRE_SEED, city: 'Chennai', state: 'Tamil Nadu', founded: 2024, mrr: 65000_00, users: 2100, growth: 85, ask: 1_00_00_000_00, equity: 18, description: 'ClosetLoop is a resale marketplace for authenticated Indian fashion brands. We verify every item, handle logistics, and offer EMI options. Growing 85% month-on-month.', cin: 'U52100TN2024PTC212345', pan: 'AABCC1234L', verified: false },
    { email: 'karan@devsync.io', name: 'Karan Malhotra', company: 'DevSync', tagline: 'AI code review for Indian IT services', sector: 'SaaS', stage: StartupStage.SEED, city: 'Pune', state: 'Maharashtra', founded: 2022, mrr: 1500000_00, users: 230, growth: 22, ask: 10_00_00_000_00, equity: 7, description: 'DevSync automates code review for large IT services companies. Used by 3 of top 10 Indian IT firms to reduce review cycles from days to minutes with AI-powered security and quality analysis.', cin: 'U72200MH2022PTC334567', pan: 'AABCD5678M', dpiit: 'DIPP45678', verified: true },
    { email: 'anita@safeher.in', name: 'Anita Deshmukh', company: 'SafeHer', tagline: 'Women safety tech with IoT wearables', sector: 'Social Impact', stage: StartupStage.MVP, city: 'Nagpur', state: 'Maharashtra', founded: 2023, mrr: 28000_00, users: 4500, growth: 40, ask: 75_00_000_00, equity: 20, description: 'SafeHer combines IoT wearables with a community-response network. Our ₹999 device connects to the app, alerts 5 trusted contacts, nearest PCR van, and streams live location. 4,500 active users in Vidarbha.', cin: 'U74999MH2023PTC256789', pan: 'AABCS9012N', verified: false },
    { email: 'rohan@stackfinance.co', name: 'Rohan Gupta', company: 'StackFinance', tagline: 'Embedded lending APIs for SaaS platforms', sector: 'Fintech', stage: StartupStage.SERIES_A, city: 'Gurugram', state: 'Haryana', founded: 2021, mrr: 4500000_00, users: 48, growth: 30, ask: 35_00_00_000_00, equity: 4, description: 'StackFinance provides embedded lending infrastructure. Any SaaS platform can offer BNPL and working capital loans through our APIs. Processing ₹120Cr monthly disbursals with 1.2% default rate.', cin: 'U65100HR2021PTC098765', pan: 'AABCS3456P', dpiit: 'DIPP56789', gstin: '06AABCS3456P1Z3', verified: true },
    { email: 'divya@nutricraft.in', name: 'Divya Menon', company: 'NutriCraft', tagline: 'Personalised Ayurvedic nutrition D2C brand', sector: 'D2C', stage: StartupStage.PRE_SEED, city: 'Kochi', state: 'Kerala', founded: 2024, mrr: 95000_00, users: 1800, growth: 70, ask: 80_00_000_00, equity: 15, description: 'NutriCraft combines Ayurvedic formulations with modern nutrition science. AI-driven dosha assessment creates personalised supplement packs. 1,800 subscribers with 68% repeat purchase rate.', cin: 'U15400KL2024PTC087654', pan: 'AABCN7890Q', verified: false },
    { email: 'amit@logisail.com', name: 'Amit Joshi', company: 'LogiSail', tagline: 'Last-mile delivery optimisation for FMCG', sector: 'Logistics', stage: StartupStage.SEED, city: 'Delhi', state: 'Delhi', founded: 2022, mrr: 680000_00, users: 165, growth: 25, ask: 6_00_00_000_00, equity: 10, description: 'LogiSail optimises last-mile delivery for FMCG companies in North India. Our route optimisation and demand prediction reduces delivery costs by 32% and stock-outs by 45%.', cin: 'U63000DL2022PTC398765', pan: 'AABCL1234R', dpiit: 'DIPP67890', verified: true },
    { email: 'nisha@propease.in', name: 'Nisha Aggarwal', company: 'PropEase', tagline: 'AI property valuation for home loans', sector: 'Proptech', stage: StartupStage.MVP, city: 'Noida', state: 'Uttar Pradesh', founded: 2023, mrr: 42000_00, users: 12, growth: 55, ask: 2_50_00_000_00, equity: 12, description: 'PropEase uses satellite imagery and transaction data to provide instant property valuations for banks. Reduces loan processing time from 15 days to 2 days. Pilot with 3 banks.', cin: 'U70100UP2023PTC456789', pan: 'AABCP5678S', verified: false },
    { email: 'siddharth@cyberfort.in', name: 'Siddharth Nair', company: 'CyberFort', tagline: 'Cybersecurity compliance for Indian SMBs', sector: 'Cybersecurity', stage: StartupStage.SEED, city: 'Bengaluru', state: 'Karnataka', founded: 2022, mrr: 920000_00, users: 85, growth: 32, ask: 7_00_00_000_00, equity: 8, description: 'CyberFort automates CERT-IN compliance, vulnerability scanning, and incident response for SMBs. 85 paying customers across BFSI and healthcare verticals.', cin: 'U72200KA2022PTC567890', pan: 'AABCC9012T', dpiit: 'DIPP78901', verified: true },
    { email: 'pooja@legalease.co', name: 'Pooja Saxena', company: 'LegalEase', tagline: 'Contract automation for Indian startups', sector: 'Legaltech', stage: StartupStage.PRE_SEED, city: 'Mumbai', state: 'Maharashtra', founded: 2024, mrr: 35000_00, users: 120, growth: 48, ask: 1_20_00_000_00, equity: 14, description: 'LegalEase generates legally vetted contracts (SHA, employment, NDA, ESOP) using GPT fine-tuned on Indian commercial law. 120 startups use our platform for automated compliance.', cin: 'U74140MH2024PTC678901', pan: 'AABCL3456U', verified: false },
    { email: 'harsh@gamecraft.gg', name: 'Harsh Vardhan', company: 'GameCraft Studio', tagline: 'Indie mobile games with Indian mythology', sector: 'Gaming', stage: StartupStage.MVP, city: 'Bengaluru', state: 'Karnataka', founded: 2023, mrr: 180000_00, users: 125000, growth: 50, ask: 3_00_00_000_00, equity: 10, description: 'GameCraft builds narrative-driven mobile games based on Indian mythology. Our first title "Arjuna\'s Quest" hit 125K downloads in 3 months with 4.6★ rating. Two more titles in development.', cin: 'U92413KA2023PTC789012', pan: 'AABCG7890V', verified: false },
    { email: 'tanvi@insuretech.in', name: 'Tanvi Bhatt', company: 'InsureSimple', tagline: 'Micro-insurance for gig workers', sector: 'Insurtech', stage: StartupStage.SEED, city: 'Ahmedabad', state: 'Gujarat', founded: 2022, mrr: 560000_00, users: 32000, growth: 38, ask: 5_50_00_000_00, equity: 9, description: 'InsureSimple offers ₹99/month accident and health cover for gig economy workers. Partnered with 3 delivery platforms. 32K active policies with claims processed in 48 hours.', cin: 'U66000GJ2022PTC890123', pan: 'AABCI1234W', dpiit: 'DIPP89012', verified: true },
    { email: 'rajesh@cleanair.tech', name: 'Rajesh Kumar', company: 'CleanAir Tech', tagline: 'IoT air quality monitoring for smart cities', sector: 'Cleantech', stage: StartupStage.PRE_SEED, city: 'Lucknow', state: 'Uttar Pradesh', founded: 2024, mrr: 22000_00, users: 15, growth: 100, ask: 90_00_000_00, equity: 16, description: 'CleanAir deploys low-cost IoT air quality sensors for municipalities. Real-time pollution mapping with predictive alerts. Pilot running in Lucknow Smart City with 15 sensor nodes.', cin: 'U29300UP2024PTC901234', pan: 'AABCC5678X', verified: false },
    { email: 'aisha@voicefirst.ai', name: 'Aisha Khan', company: 'VoiceFirst AI', tagline: 'Voice AI assistants in Indian languages', sector: 'AI/ML', stage: StartupStage.SEED, city: 'Bengaluru', state: 'Karnataka', founded: 2022, mrr: 1100000_00, users: 450, growth: 35, ask: 12_00_00_000_00, equity: 7, description: 'VoiceFirst builds custom voice AI assistants that understand Hindi, Tamil, Telugu, and 5 more Indian languages with 94% accuracy. Used by banks, insurance, and government helplines.', cin: 'U72200KA2022PTC012345', pan: 'AABCV9012Y', dpiit: 'DIPP90123', verified: true },
    { email: 'dev@spaceview.in', name: 'Dev Prakash', company: 'SpaceView', tagline: 'Satellite data analytics for agriculture', sector: 'Spacetech', stage: StartupStage.MVP, city: 'Hyderabad', state: 'Telangana', founded: 2023, mrr: 75000_00, users: 28, growth: 60, ask: 4_00_00_000_00, equity: 11, description: 'SpaceView analyses satellite imagery to provide crop health, soil moisture, and yield prediction to agribusinesses and insurance companies. 28 enterprise clients across AP and Telangana.', cin: 'U74999TS2023PTC123456', pan: 'AABCS3456Z', verified: false },
    { email: 'kavita@hrtoolkit.in', name: 'Kavita Rao', company: 'HRToolkit', tagline: 'All-in-one HR platform for Indian SMBs', sector: 'HRtech', stage: StartupStage.SEED, city: 'Pune', state: 'Maharashtra', founded: 2022, mrr: 750000_00, users: 340, growth: 20, ask: 4_50_00_000_00, equity: 8, description: 'HRToolkit handles payroll, compliance (PF/ESI/TDS), attendance, and hiring for Indian SMBs with 10-200 employees. 340 companies, 45K employees processed monthly.', cin: 'U72200MH2022PTC234567', pan: 'AABCH7890A', dpiit: 'DIPP01234', verified: true },
    { email: 'nikhil@biotrack.co', name: 'Nikhil Deshpande', company: 'BioTrack', tagline: 'Biomarker tracking for preventive health', sector: 'Biotech', stage: StartupStage.PRE_SEED, city: 'Pune', state: 'Maharashtra', founded: 2024, mrr: 18000_00, users: 450, growth: 90, ask: 1_80_00_000_00, equity: 14, description: 'BioTrack uses at-home test kits + app to track 15 biomarkers over time. AI predicts health risks 6 months ahead. 450 beta users with 82% weekly active rate.', cin: 'U85110MH2024PTC345678', pan: 'AABCB1234B', verified: false },
    { email: 'sunita@mediastack.in', name: 'Sunita Verma', company: 'MediaStack', tagline: 'Regional language content monetisation', sector: 'Media & Entertainment', stage: StartupStage.MVP, city: 'Patna', state: 'Bihar', founded: 2023, mrr: 55000_00, users: 85000, growth: 42, ask: 2_00_00_000_00, equity: 12, description: 'MediaStack helps regional language content creators monetise through micro-subscriptions and brand deals. 85K creators in Hindi, Bhojpuri, and Maithili. Processing ₹15L/month in creator payouts.', cin: 'U92100BR2023PTC456789', pan: 'AABCM5678C', verified: false },
    { email: 'varun@smartfarm.io', name: 'Varun Thakur', company: 'SmartFarm', tagline: 'Precision agriculture drones for small farmers', sector: 'Agritech', stage: StartupStage.SEED, city: 'Indore', state: 'Madhya Pradesh', founded: 2022, mrr: 420000_00, users: 1200, growth: 30, ask: 6_00_00_000_00, equity: 9, description: 'SmartFarm provides drone-as-a-service for crop spraying, mapping, and monitoring. 1,200 farmers served across MP and Rajasthan. 40% cost reduction vs manual spraying.', cin: 'U01400MP2022PTC567890', pan: 'AABCS9012D', dpiit: 'DIPP12340', verified: true },
    { email: 'ritu@studybuddy.app', name: 'Ritu Kapoor', company: 'StudyBuddy', tagline: 'AI tutor for competitive exam prep', sector: 'Edtech', stage: StartupStage.PRE_SEED, city: 'Kota', state: 'Rajasthan', founded: 2024, mrr: 130000_00, users: 8500, growth: 55, ask: 1_50_00_000_00, equity: 13, description: 'StudyBuddy is an AI tutor that creates personalised study plans for JEE/NEET aspirants. Adaptive testing, doubt resolution in Hindi/English, and performance analytics. 8,500 students in 2 months.', cin: 'U80900RJ2024PTC678901', pan: 'AABCS3456E', verified: false },
    { email: 'manish@webchain.in', name: 'Manish Agarwal', company: 'WebChain', tagline: 'Blockchain-based supply chain for pharma', sector: 'Web3 & Blockchain', stage: StartupStage.MVP, city: 'Chandigarh', state: 'Chandigarh', founded: 2023, mrr: 88000_00, users: 22, growth: 35, ask: 3_50_00_000_00, equity: 10, description: 'WebChain provides blockchain-based track-and-trace for pharmaceutical supply chains. Ensures drug authenticity from manufacturer to pharmacy. Pilot with 2 pharma MNCs and 22 distribution points.', cin: 'U72200CH2023PTC789012', pan: 'AABCW7890F', verified: false },
  ];

  const startupUsers = [];
  const startups = [];

  for (const s of startupData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash,
        name: s.name,
        role: UserRole.STARTUP,
        emailVerified: true,
      },
    });
    startupUsers.push(user);

    const startup = await prisma.startup.create({
      data: {
        userId: user.id,
        companyName: s.company,
        tagline: s.tagline,
        sector: s.sector,
        stage: s.stage,
        city: s.city,
        state: s.state,
        foundedYear: s.founded,
        teamSize: Math.floor(Math.random() * 30) + 3,
        website: `https://${s.company.toLowerCase().replace(/\s+/g, '')}.in`,
        linkedin: `https://linkedin.com/company/${s.company.toLowerCase().replace(/\s+/g, '-')}`,
        description: s.description,
        problemStatement: `The ${s.sector} space in India lacks ${s.tagline.toLowerCase()}.`,
        solution: s.description,
        mrr: s.mrr,
        totalUsers: s.users,
        growthRateMom: s.growth,
        fundingAsk: s.ask,
        equityOffered: s.equity,
        useOfFunds: 'Product development (40%), Sales & Marketing (30%), Team expansion (20%), Operations (10%)',
        cin: s.cin,
        companyPan: s.pan,
        dpiitNumber: s.dpiit || null,
        gstin: s.gstin || null,
        verificationStatus: s.verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
        verifiedAt: s.verified ? new Date() : null,
        isPublished: true,
        profileCompleteness: s.verified ? 85 + Math.random() * 15 : 50 + Math.random() * 30,
        leaderboardScore: s.verified ? Math.random() * 60 + 40 : Math.random() * 30,
      },
    });
    startups.push(startup);

    // Add team members
    const teamNames = ['CTO', 'COO', 'VP Engineering', 'Head of Sales', 'Lead Designer'];
    const memberCount = Math.min(Math.floor(Math.random() * 3) + 1, teamNames.length);
    for (let i = 0; i < memberCount; i++) {
      await prisma.teamMember.create({
        data: {
          startupId: startup.id,
          name: `Team Member ${i + 1}`,
          role: teamNames[i],
          linkedin: `https://linkedin.com/in/team-member-${i}`,
        },
      });
    }

    // Add milestones
    await prisma.milestone.create({
      data: {
        startupId: startup.id,
        title: 'Company Incorporated',
        description: `${s.company} was officially registered`,
        date: new Date(s.founded, 0, 15),
        achieved: true,
      },
    });
    await prisma.milestone.create({
      data: {
        startupId: startup.id,
        title: 'First Customer',
        description: 'Signed our first paying customer',
        date: new Date(s.founded, 3, 1),
        achieved: s.mrr > 0,
      },
    });

    // Add startup updates
    for (let m = 0; m < 3; m++) {
      const updateDate = new Date();
      updateDate.setMonth(updateDate.getMonth() - m);
      await prisma.startupUpdate.create({
        data: {
          startupId: startup.id,
          title: `${['October', 'September', 'August'][m]} Update`,
          content: `Monthly metrics: MRR ₹${(s.mrr / 100).toLocaleString('en-IN')}, ${s.users} users, ${s.growth}% MoM growth. Key highlights this month include product improvements and team growth.`,
          isPublic: true,
          createdAt: updateDate,
        },
      });
    }

    // Add traction snapshots
    for (let t = 0; t < 6; t++) {
      const snapshotDate = new Date();
      snapshotDate.setMonth(snapshotDate.getMonth() - t);
      const factor = 1 - (t * 0.08);
      await prisma.tractionSnapshot.create({
        data: {
          startupId: startup.id,
          mrr: Math.floor(s.mrr * factor),
          totalUsers: Math.floor(s.users * factor),
          growthRate: s.growth + (Math.random() * 10 - 5),
          recordedAt: snapshotDate,
        },
      });
    }
  }
  console.log(`✅ ${startups.length} startups created`);

  // ── Investors ──
  const investorData = [
    { email: 'rajiv@blumeraise.vc', name: 'Rajiv Mehra', display: 'Rajiv Mehra', type: InvestorType.VC, firm: 'BlumeRaise Ventures', bio: 'Partner at BlumeRaise, a $40M early-stage fund focused on Indian SaaS and Fintech. Ex-McKinsey, IIT Delhi, ISB.', thesis: 'We back technical founders building for India and global markets in SaaS, Fintech, and AI. Prefer seed to Series A.', sectors: ['Fintech', 'SaaS', 'AI/ML'], stages: ['SEED', 'SERIES_A'], ticketMin: 50_00_000_00, ticketMax: 5_00_00_000_00, sebi: 'IN/AIF2/22-23/1234', verified: true },
    { email: 'kavita@growthbridge.in', name: 'Kavita Subramanian', display: 'Kavita Subramanian', type: InvestorType.VC, firm: 'GrowthBridge Capital', bio: 'Managing Director at GrowthBridge, investing in consumer and healthcare startups since 2015. Portfolio includes 3 unicorns.', thesis: 'Consumer-first brands and healthtech solving for the next 500M Indians. Series A and beyond.', sectors: ['Healthtech', 'D2C', 'Edtech'], stages: ['PRE_SEED', 'SEED', 'SERIES_A'], ticketMin: 1_00_00_000_00, ticketMax: 10_00_00_000_00, sebi: 'IN/AIF2/21-22/5678', verified: true },
    { email: 'anand.shah@angelindia.co', name: 'Anand Shah', display: 'Anand Shah', type: InvestorType.ANGEL, firm: null, bio: 'Serial entrepreneur turned angel. Founded and exited 2 SaaS companies. Active angel in 30+ startups. Mentor at T-Hub and NASSCOM 10K.', thesis: 'Technical founders with domain expertise, ideally repeat founders. Pre-seed and seed only. Hands-on mentoring, not passive capital.', sectors: ['SaaS', 'Cybersecurity', 'AI/ML', 'Deeptech'], stages: ['PRE_SEED', 'SEED'], ticketMin: 10_00_000_00, ticketMax: 50_00_000_00, sebi: null, verified: true },
    { email: 'priyanka@familyoffice.in', name: 'Priyanka Birla', display: 'Priyanka Birla', type: InvestorType.FAMILY_OFFICE, firm: 'Birla Family Office', bio: 'Managing the family investment office with a focus on next-generation businesses. INSEAD MBA, CFA.', thesis: 'Long-term value creation in energy transition, agritech, and social impact ventures. Patient capital with 7-10 year horizon.', sectors: ['Cleantech', 'Agritech', 'Social Impact', 'EV & Mobility'], stages: ['SEED', 'SERIES_A', 'SERIES_B_PLUS'], ticketMin: 2_00_00_000_00, ticketMax: 15_00_00_000_00, sebi: null, verified: true },
    { email: 'suresh@hni.invest', name: 'Suresh Rajan', display: 'Suresh Rajan', type: InvestorType.HNI, firm: null, bio: 'Retired tech executive (VP at Infosys), investing personal capital in Indian startups since 2018. 12 active investments.', thesis: 'B2B startups with clear revenue, preferably in IT services adjacencies. No moonshots — show me the unit economics.', sectors: ['SaaS', 'HRtech', 'Legaltech', 'Logistics'], stages: ['SEED', 'SERIES_A'], ticketMin: 25_00_000_00, ticketMax: 1_00_00_000_00, sebi: null, verified: true },
    { email: 'divya@corporatevc.com', name: 'Divya Narayan', display: 'Divya Narayan', type: InvestorType.CORPORATE, firm: 'TechCorp Ventures', bio: 'Head of Strategic Investments at TechCorp. We invest in startups that can create synergies with our enterprise software business.', thesis: 'Enterprise SaaS, cybersecurity, and AI tools that integrate with our product suite. Strategic value mandatory.', sectors: ['SaaS', 'Cybersecurity', 'AI/ML'], stages: ['SEED', 'SERIES_A', 'SERIES_B_PLUS'], ticketMin: 1_00_00_000_00, ticketMax: 20_00_00_000_00, sebi: 'IN/AIF2/23-24/9012', verified: true },
    { email: 'mohan@seedfund.in', name: 'Mohan Lakshmi', display: 'Mohan Lakshmi', type: InvestorType.VC, firm: 'SeedSpark Fund', bio: 'GP at SeedSpark, a $15M micro-VC fund. We write first cheques for exceptional founders. IIM-A, ex-Sequoia scout.', thesis: 'Pre-seed and seed in fintech, proptech, and insurtech. India-first models with global potential.', sectors: ['Fintech', 'Proptech', 'Insurtech'], stages: ['PRE_SEED', 'SEED'], ticketMin: 25_00_000_00, ticketMax: 1_50_00_000_00, sebi: 'IN/AIF2/23-24/3456', verified: true },
    { email: 'neha@impactcap.org', name: 'Neha Gupta', display: 'Neha Gupta', type: InvestorType.ANGEL, firm: null, bio: 'Impact investor and ex-Gates Foundation. Focused on health, education, and climate solutions in India. 15+ angel investments.', thesis: 'Startups creating measurable social impact with sustainable business models. Must have a clear theory of change.', sectors: ['Healthtech', 'Edtech', 'Cleantech', 'Social Impact'], stages: ['PRE_SEED', 'SEED'], ticketMin: 5_00_000_00, ticketMax: 25_00_000_00, sebi: null, verified: true },
    { email: 'akash@venturenext.co', name: 'Akash Mittal', display: 'Akash Mittal', type: InvestorType.VC, firm: 'VentureNext Partners', bio: 'Co-founder & Partner at VentureNext, a $60M fund focused on Bharat-first startups. Stanford GSB, ex-Google.', thesis: 'Consumer internet, logistics, and agritech for Tier-2/3 India. We love founders who understand Bharat.', sectors: ['E-commerce', 'Logistics', 'Agritech', 'D2C'], stages: ['SEED', 'SERIES_A'], ticketMin: 50_00_000_00, ticketMax: 8_00_00_000_00, sebi: 'IN/AIF2/22-23/7890', verified: true },
    { email: 'sanjay@techfund.in', name: 'Sanjay Kapoor', display: 'Sanjay Kapoor', type: InvestorType.HNI, firm: null, bio: 'CTO-turned-investor. 20 years in Silicon Valley, now investing in Indian deep tech and space tech. IIT Bombay, MS Stanford.', thesis: 'Deep tech, space tech, biotech — companies pushing technical boundaries. Will co-invest with institutional VCs.', sectors: ['Deeptech', 'Spacetech', 'Biotech', 'AI/ML'], stages: ['PRE_SEED', 'SEED', 'SERIES_A'], ticketMin: 15_00_000_00, ticketMax: 75_00_000_00, sebi: null, verified: true },
    { email: 'meena@elevate.vc', name: 'Meena Krishnamurthy', display: 'Meena Krishnamurthy', type: InvestorType.VC, firm: 'Elevate Ventures', bio: 'Founding Partner at Elevate, a gender-lens VC fund. We back women-led startups across sectors. $25M Fund I.', thesis: 'Women-founded or co-founded startups at any stage. Sector agnostic but strong preference for consumer and healthtech.', sectors: ['Healthtech', 'D2C', 'Edtech', 'Fintech', 'Social Impact'], stages: ['PRE_SEED', 'SEED', 'SERIES_A'], ticketMin: 25_00_000_00, ticketMax: 3_00_00_000_00, sebi: 'IN/AIF2/23-24/4567', verified: true },
    { email: 'ravi@eastbridge.in', name: 'Ravi Sundaram', display: 'Ravi Sundaram', type: InvestorType.FAMILY_OFFICE, firm: 'EastBridge Family Office', bio: 'Third-generation family office diversifying into venture. Focus on sustainable businesses with strong fundamentals.', thesis: 'Profitable or near-profitable startups in traditional sectors being disrupted by technology. Prefer majority or significant minority stakes.', sectors: ['Agritech', 'Logistics', 'E-commerce', 'Cleantech'], stages: ['SERIES_A', 'SERIES_B_PLUS'], ticketMin: 5_00_00_000_00, ticketMax: 25_00_00_000_00, sebi: null, verified: true },
    { email: 'arun@microseed.in', name: 'Arun Tiwari', display: 'Arun Tiwari', type: InvestorType.ANGEL, firm: null, bio: 'Product leader at a unicorn by day, angel investor by passion. 8 investments, 2 exits. Focused on B2B products.', thesis: 'B2B SaaS with clear product-market fit. I bring product expertise and intros to enterprise buyers.', sectors: ['SaaS', 'HRtech', 'Legaltech', 'Cybersecurity'], stages: ['PRE_SEED', 'SEED'], ticketMin: 5_00_000_00, ticketMax: 20_00_000_00, sebi: null, verified: false },
    { email: 'geeta@wealthwise.in', name: 'Geeta Shankar', display: 'Geeta Shankar', type: InvestorType.HNI, firm: null, bio: 'Retired banker (MD at HDFC), now deploying into early-stage ventures with a focus on financial inclusion and women empowerment.', thesis: 'Fintech and insurtech solving for financial inclusion. Strong bias for rural and semi-urban focused startups.', sectors: ['Fintech', 'Insurtech', 'Social Impact'], stages: ['SEED'], ticketMin: 10_00_000_00, ticketMax: 50_00_000_00, sebi: null, verified: true },
    { email: 'vikrant@gamingvc.in', name: 'Vikrant Jain', display: 'Vikrant Jain', type: InvestorType.VC, firm: 'Level Up Gaming Fund', bio: 'India\'s first gaming-focused VC fund. $10M deployed across 12 gaming and esports companies.', thesis: 'Gaming studios, esports platforms, and gaming infrastructure. India is the world\'s largest mobile gaming market.', sectors: ['Gaming', 'Media & Entertainment'], stages: ['PRE_SEED', 'SEED', 'SERIES_A'], ticketMin: 25_00_000_00, ticketMax: 2_00_00_000_00, sebi: 'IN/AIF2/22-23/6789', verified: true },
  ];

  const investorUsers = [];
  const investors = [];

  for (const inv of investorData) {
    const user = await prisma.user.create({
      data: {
        email: inv.email,
        passwordHash,
        name: inv.name,
        role: UserRole.INVESTOR,
        emailVerified: true,
      },
    });
    investorUsers.push(user);

    const investor = await prisma.investor.create({
      data: {
        userId: user.id,
        displayName: inv.display,
        type: inv.type,
        firmName: inv.firm,
        bio: inv.bio,
        thesis: inv.thesis,
        sectors: inv.sectors,
        stagePreference: inv.stages,
        ticketSizeMin: inv.ticketMin,
        ticketSizeMax: inv.ticketMax,
        geographyPreference: ['Pan India'],
        pastInvestments: 'Multiple early-stage investments in Indian startups',
        linkedin: `https://linkedin.com/in/${inv.name.toLowerCase().replace(/\s+/g, '-')}`,
        pan: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
        sebiRegistration: inv.sebi,
        netWorthDeclaration: true,
        accreditedInvestor: true,
        verificationStatus: inv.verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
        verifiedAt: inv.verified ? new Date() : null,
      },
    });
    investors.push(investor);
  }
  console.log(`✅ ${investors.length} investors created`);

  // ── Create interests (investor → startup connections) ──
  const interestPairs = [
    { investorIdx: 0, startupIdx: 0, status: InterestStatus.COMMITTED, amount: 1_00_00_000_00 },
    { investorIdx: 0, startupIdx: 6, status: InterestStatus.ACCEPTED, amount: 75_00_000_00 },
    { investorIdx: 1, startupIdx: 1, status: InterestStatus.COMMITTED, amount: 1_50_00_000_00 },
    { investorIdx: 1, startupIdx: 3, status: InterestStatus.EXPRESSED, amount: 3_00_00_000_00 },
    { investorIdx: 2, startupIdx: 6, status: InterestStatus.ACCEPTED, amount: 25_00_000_00 },
    { investorIdx: 2, startupIdx: 12, status: InterestStatus.EXPRESSED, amount: 20_00_000_00 },
    { investorIdx: 3, startupIdx: 2, status: InterestStatus.COMMITTED, amount: 50_00_000_00 },
    { investorIdx: 3, startupIdx: 4, status: InterestStatus.EXPRESSED, amount: 5_00_00_000_00 },
    { investorIdx: 4, startupIdx: 10, status: InterestStatus.ACCEPTED, amount: 40_00_000_00 },
    { investorIdx: 5, startupIdx: 12, status: InterestStatus.COMMITTED, amount: 2_00_00_000_00 },
    { investorIdx: 6, startupIdx: 0, status: InterestStatus.EXPRESSED, amount: 50_00_000_00 },
    { investorIdx: 6, startupIdx: 15, status: InterestStatus.ACCEPTED, amount: 30_00_000_00 },
    { investorIdx: 7, startupIdx: 1, status: InterestStatus.EXPRESSED, amount: 15_00_000_00 },
    { investorIdx: 7, startupIdx: 7, status: InterestStatus.ACCEPTED, amount: 10_00_000_00 },
    { investorIdx: 8, startupIdx: 2, status: InterestStatus.EXPRESSED, amount: 1_00_00_000_00 },
    { investorIdx: 8, startupIdx: 10, status: InterestStatus.COMMITTED, amount: 2_50_00_000_00 },
    { investorIdx: 9, startupIdx: 18, status: InterestStatus.EXPRESSED, amount: 30_00_000_00 },
    { investorIdx: 10, startupIdx: 5, status: InterestStatus.ACCEPTED, amount: 50_00_000_00 },
    { investorIdx: 10, startupIdx: 9, status: InterestStatus.EXPRESSED, amount: 25_00_000_00 },
    { investorIdx: 11, startupIdx: 22, status: InterestStatus.EXPRESSED, amount: 3_00_00_000_00 },
  ];

  const interests = [];
  for (const pair of interestPairs) {
    const interest = await prisma.interest.create({
      data: {
        investorId: investors[pair.investorIdx].id,
        startupId: startups[pair.startupIdx].id,
        status: pair.status,
        ticketAmount: pair.amount,
        message: `Interested in investing in this startup. The ${startupData[pair.startupIdx].sector} space has tremendous potential.`,
        committedAt: pair.status === InterestStatus.COMMITTED ? new Date() : null,
        startupConfirmed: pair.status === InterestStatus.COMMITTED,
        investorConfirmed: pair.status === InterestStatus.COMMITTED,
      },
    });
    interests.push(interest);

    // Create chat room for accepted/committed interests
    if (pair.status === InterestStatus.ACCEPTED || pair.status === InterestStatus.COMMITTED) {
      const chatRoom = await prisma.chatRoom.create({
        data: {
          interestId: interest.id,
          members: {
            create: [
              { userId: startupUsers[pair.startupIdx].id },
              { userId: investorUsers[pair.investorIdx].id },
            ],
          },
        },
      });

      // Add some chat messages
      const messages = [
        { senderId: investorUsers[pair.investorIdx].id, content: `Hi! I'm very interested in ${startupData[pair.startupIdx].company}. Can we discuss the round details?` },
        { senderId: startupUsers[pair.startupIdx].id, content: `Thank you for your interest! We're raising ₹${(startupData[pair.startupIdx].ask / 100).toLocaleString('en-IN')} at ${startupData[pair.startupIdx].equity}% equity. Happy to share more details.` },
        { senderId: investorUsers[pair.investorIdx].id, content: 'That sounds reasonable. Could you share your latest traction numbers and pitch deck?' },
        { senderId: startupUsers[pair.startupIdx].id, content: `Sure! Our current MRR is ₹${(startupData[pair.startupIdx].mrr / 100).toLocaleString('en-IN')} with ${startupData[pair.startupIdx].growth}% MoM growth. I'll share the deck shortly.` },
      ];

      for (let i = 0; i < messages.length; i++) {
        const msgDate = new Date();
        msgDate.setHours(msgDate.getHours() - (messages.length - i));
        await prisma.chatMessage.create({
          data: {
            chatRoomId: chatRoom.id,
            senderId: messages[i].senderId,
            content: messages[i].content,
            isRead: true,
            readAt: msgDate,
            createdAt: msgDate,
          },
        });
      }
    }
  }
  console.log(`✅ ${interests.length} interests created with chat rooms`);

  // ── Reviews (startups reviewing investors on committed deals) ──
  const committedInterests = interests.filter((_, i) => interestPairs[i].status === InterestStatus.COMMITTED);
  for (const interest of committedInterests) {
    const pair = interestPairs[interests.indexOf(interest)];
    const ratings = {
      responsiveness: Math.floor(Math.random() * 2) + 4,
      transparency: Math.floor(Math.random() * 2) + 3,
      founderFriendliness: Math.floor(Math.random() * 2) + 4,
      valueAdd: Math.floor(Math.random() * 3) + 3,
      followThrough: Math.floor(Math.random() * 2) + 4,
      decisionSpeed: Math.floor(Math.random() * 3) + 3,
    };
    const overallScore = Object.values(ratings).reduce((a, b) => a + b, 0) / 6;

    await prisma.review.create({
      data: {
        interestId: interest.id,
        investorId: investors[pair.investorIdx].id,
        startupId: startups[pair.startupIdx].id,
        ...ratings,
        overallScore,
        comment: `Great experience working with this investor. They were responsive and provided valuable insights beyond just capital. The due diligence process was thorough but fair.`,
        investorReply: 'Thank you for the kind review! It was a pleasure working with your team. Excited about the journey ahead.',
        investorRepliedAt: new Date(),
      },
    });

    // Update investor average rating
    const avgResult = await prisma.review.aggregate({
      where: { investorId: investors[pair.investorIdx].id },
      _avg: { overallScore: true },
      _count: true,
    });
    await prisma.investor.update({
      where: { id: investors[pair.investorIdx].id },
      data: {
        averageRating: avgResult._avg.overallScore || 0,
        totalReviews: avgResult._count,
      },
    });
  }
  console.log('✅ Reviews created');

  // ── Saved startups ──
  for (let i = 0; i < 8; i++) {
    await prisma.savedStartup.create({
      data: {
        investorId: investors[i % investors.length].id,
        startupId: startups[(i * 3) % startups.length].id,
      },
    });
  }
  console.log('✅ Saved startups created');

  // ── Notifications ──
  for (const pair of interestPairs.slice(0, 10)) {
    await prisma.notification.create({
      data: {
        userId: startupUsers[pair.startupIdx].id,
        type: 'INTEREST_RECEIVED',
        title: 'New investor interest',
        body: `${investorData[pair.investorIdx].display} from ${investorData[pair.investorIdx].firm || 'Independent'} expressed interest in your startup.`,
        data: { investorId: investors[pair.investorIdx].id },
      },
    });
  }
  console.log('✅ Notifications created');

  // ── Audit logs ──
  const verifiedStartups = startups.filter((_, i) => startupData[i].verified);
  for (const startup of verifiedStartups) {
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'VERIFY_STARTUP',
        entityType: 'Startup',
        entityId: startup.id,
        details: { reason: 'Documents verified successfully. CIN and PAN validated.' },
        ipAddress: '127.0.0.1',
      },
    });
  }
  console.log('✅ Audit logs created');

  console.log('\n🎉 Seed complete!');
  console.log(`   ${startups.length} startups, ${investors.length} investors, ${interests.length} interests`);
  console.log('   Login with any seeded email + password: Test@1234');
  console.log('   Admin: admin@nidhiflow.in / Test@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

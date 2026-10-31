// Seeds approved sources, STARTER service records and the first admin.
// IMPORTANT: every record is seeded as "needs_verification" (max trust = MEDIUM).
// A human must check each record against its official page, then press "Verify" in the admin API/dashboard.
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import KnowledgeSource from '../models/KnowledgeSource.js';
import GovernmentService from '../models/GovernmentService.js';

const sources = [
  { name: 'NSAP - National Social Assistance Programme', authority: 'Ministry of Rural Development, Govt of India', url: 'https://nsap.nic.in' },
  { name: 'National Food Security Portal', authority: 'Dept of Food & Public Distribution, Govt of India', url: 'https://nfsa.gov.in' },
  { name: 'National Scholarship Portal', authority: 'Govt of India', url: 'https://scholarships.gov.in' },
  { name: 'Ayushman Bharat PM-JAY', authority: 'National Health Authority', url: 'https://pmjay.gov.in' },
  { name: 'National Cyber Crime Reporting Portal', authority: 'Ministry of Home Affairs, Govt of India', url: 'https://cybercrime.gov.in' },
];
const Q = (en, hi, te) => ({ en, hi, te });
const services = [
  { slug: 'old-age-pension', src: 0, category: 'pension', faq: true,
    name: Q('Old Age Pension', 'वृद्धावस्था पेंशन', 'వృద్ధాప్య పెన్షన్'),
    description: 'Central old-age pension under NSAP (IGNOAPS) for elderly people from poor households. States may add their own pension schemes with different rules.',
    eligibilityText: ['Age 60 years or more', 'Household below poverty line (BPL)', 'State schemes can differ: check your state portal'],
    eligibilityRules: [
      { key: 'age', label: 'Age 60 or more', type: 'number', op: 'gte', value: 60, question: Q('What is your age?', 'आपकी उम्र कितनी है?', 'మీ వయస్సు ఎంత?') },
      { key: 'bpl', label: 'BPL household', type: 'boolean', op: 'eq', value: true, question: Q('Does your family have a BPL card?', 'क्या आपके परिवार के पास बीपीएल कार्ड है?', 'మీ కుటుంబానికి BPL కార్డు ఉందా?') },
      { key: 'state', label: 'State of residence (state rules differ)', type: 'text', op: 'info', question: Q('Which state do you live in?', 'आप किस राज्य में रहते हैं?', 'మీరు ఏ రాష్ట్రంలో ఉంటున్నారు?') },
      { key: 'otherPension', label: 'No other pension', type: 'boolean', op: 'eq', value: false, question: Q('Do you currently receive another pension?', 'क्या आप अभी कोई और पेंशन पाते हैं?', 'మీరు ప్రస్తుతం మరో పెన్షన్ పొందుతున్నారా?') },
    ],
    documents: [
      { key: 'age-proof', name: Q('Age proof', 'आयु प्रमाण', 'వయస్సు రుజువు'), explain: 'A paper that shows your date of birth, like a birth or school certificate.', howToObtain: 'Ask the local municipal or panchayat office, or your old school.' },
      { key: 'bpl-proof', name: Q('BPL / ration card', 'बीपीएल / राशन कार्ड', 'BPL / రేషన్ కార్డు'), explain: 'Shows that your family is in the poor-household list.', howToObtain: 'Ask the Mandal / block office or ration shop.' },
      { key: 'address-proof', name: Q('Address proof', 'पता प्रमाण', 'చిరునామా రుజువు'), explain: 'A paper showing where you live.', howToObtain: 'Gram panchayat or ward office can guide you.' },
      { key: 'bank-passbook', name: Q('Bank or post office passbook', 'बैंक/डाकघर पासबुक', 'బ్యాంక్/పోస్టాఫీసు పాస్‌బుక్'), explain: 'The pension money is paid into this account.', howToObtain: 'Open a savings account at any bank or post office.' },
      { key: 'photo', name: Q('Passport size photo', 'पासपोर्ट फोटो', 'పాస్‌పోర్ట్ ఫోటో'), explain: 'A recent small photo of yourself.', howToObtain: 'Any photo studio.' },
    ],
    procedure: ['Keep the documents ready', 'Visit the gram panchayat, ward or mandal office, or the state pension portal', 'Fill the application form (ask the office helper if you need help)', 'Keep the receipt and application number', 'Never pay anyone to approve your pension'],
    keywords: ['pension', 'old age', 'పింఛన్', 'పెన్షన్', 'वृद्धावस्था', 'पेंशन', 'పింఛను', 'oap'] },
  { slug: 'ration-card', src: 1, category: 'ration', faq: true,
    name: Q('Ration Card', 'राशन कार्ड', 'రేషన్ కార్డు'),
    description: 'Ration cards let eligible households buy subsidised food grains under the National Food Security Act. Application is handled by your state food department.',
    eligibilityText: ['Rules and income limits are set by each state', 'Check the state food department for exact rules'],
    eligibilityRules: [
      { key: 'state', label: 'State of residence (state rules differ)', type: 'text', op: 'info', question: Q('Which state do you live in?', 'आप किस राज्य में रहते हैं?', 'మీరు ఏ రాష్ట్రంలో ఉంటున్నారు?') },
    ],
    documents: [
      { key: 'id-proof', name: Q('Identity proof of family members', 'परिवार के सदस्यों का पहचान प्रमाण', 'కుటుంబ సభ్యుల గుర్తింపు రుజువు'), explain: 'A paper that proves who each family member is.', howToObtain: 'Ask your gram panchayat or Mandal office.' },
      { key: 'address-proof', name: Q('Address proof', 'पता प्रमाण', 'చిరునామా రుజువు'), explain: 'Shows your home address.', howToObtain: 'Gram panchayat or ward office.' },
      { key: 'income-proof', name: Q('Income certificate', 'आय प्रमाण पत्र', 'ఆదాయ ధృవీకరణ పత్రం'), explain: 'Shows how much your family earns.', howToObtain: 'Apply at the Mandal / tehsil office or Mee Seva / CSC centre.' },
      { key: 'photo', name: Q('Passport size photos', 'पासपोर्ट फोटो', 'పాస్‌పోర్ట్ ఫోటోలు'), explain: 'Recent small photos of family members.', howToObtain: 'Any photo studio.' },
    ],
    procedure: ['Collect the documents', 'Apply through your state food department portal or local office / CSC centre', 'Note the application number', 'Never pay anyone extra to get a card'],
    keywords: ['ration', 'రేషన్', 'राशन', 'ration card', 'food card'] },
  { slug: 'scholarship', src: 2, category: 'scholarship', faq: true,
    name: Q('Scholarships (National Scholarship Portal)', 'छात्रवृत्ति', 'స్కాలర్‌షిప్'),
    description: 'The National Scholarship Portal lists central and state scholarships for students. Each scholarship has its own rules and last date.',
    eligibilityText: ['Each scholarship has its own rules for course, marks and family income', 'Check the portal for the scholarship you want'],
    eligibilityRules: [{ key: 'state', label: 'State of residence', type: 'text', op: 'info', question: Q('Which state do you live in?', 'आप किस राज्य में रहते हैं?', 'మీరు ఏ రాష్ట్రంలో ఉంటున్నారు?') }],
    documents: [
      { key: 'income-proof', name: Q('Family income certificate', 'पारिवारिक आय प्रमाण पत्र', 'కుటుంబ ఆదాయ ధృవీకరణ'), explain: 'Shows family yearly income.', howToObtain: 'Mandal / tehsil office or CSC centre.' },
      { key: 'marksheet', name: Q('Last exam marksheet', 'पिछली परीक्षा की मार्कशीट', 'చివరి పరీక్ష మార్కుల జాబితా'), explain: 'Your marks from the previous class.', howToObtain: 'Your school or college office.' },
      { key: 'student-bank', name: Q("Student's bank passbook", 'छात्र की बैंक पासबुक', 'విద్యార్థి బ్యాంక్ పాస్‌బుక్'), explain: 'Money goes into this account.', howToObtain: 'Open a savings account at a bank.' },
      { key: 'bonafide', name: Q('Bonafide / study certificate', 'बोनाफाइड प्रमाण पत्र', 'బోనఫైడ్ సర్టిఫికేట్'), explain: 'Paper from school or college that you study there.', howToObtain: 'School or college office.' },
    ],
    procedure: ['Visit the National Scholarship Portal or your state portal', 'Choose a scholarship and read its rules', 'Fill the form and upload documents with help from your school or a CSC centre', 'Note the application ID and the last date'],
    keywords: ['scholarship', 'స్కాలర్‌షిప్', 'స్కాలర్షిప్', 'छात्रवृत्ति', 'student', 'fee reimbursement'] },
  { slug: 'ayushman-bharat', src: 3, category: 'health', faq: true,
    name: Q('Ayushman Bharat PM-JAY (health cover)', 'आयुष्मान भारत', 'ఆయుష్మాన్ భారత్'),
    description: 'PM-JAY gives cashless hospital treatment cover to eligible poor families at listed hospitals. Eligibility is based on official family lists and state schemes may add more.',
    eligibilityText: ['Based on official family lists, not on a form you fill', 'You can check your name on the official PM-JAY portal or at a listed hospital help desk'],
    eligibilityRules: [{ key: 'state', label: 'State of residence', type: 'text', op: 'info', question: Q('Which state do you live in?', 'आप किस राज्य में रहते हैं?', 'మీరు ఏ రాష్ట్రంలో ఉంటున్నారు?') }],
    documents: [
      { key: 'id-proof', name: Q('Identity proof', 'पहचान प्रमाण', 'గుర్తింపు రుజువు'), explain: 'A paper that proves who you are.', howToObtain: 'Gram panchayat or Mandal office.' },
      { key: 'family-proof', name: Q('Family proof / ration card', 'परिवार प्रमाण / राशन कार्ड', 'కుటుంబ రుజువు / రేషన్ కార్డు'), explain: 'Shows who is in your family.', howToObtain: 'Mandal office or ration shop.' },
    ],
    procedure: ['Check whether your family is listed on the official portal or at a hospital help desk', 'If listed, ask for the health card at a CSC centre or hospital help desk', 'Treatment is cashless at listed hospitals. Nobody should charge you to enrol'],
    keywords: ['ayushman', 'health', 'hospital', 'ఆయుష్మాన్', 'ఆరోగ్య', 'आयुष्मान', 'स्वास्थ्य', 'arogyasri', 'ఆరోగ్యశ్రీ'] },
  { slug: 'scam-safety', src: 4, category: 'safety', faq: true,
    name: Q('Scam and fraud safety', 'धोखाधड़ी से सुरक्षा', 'మోసాల నుండి రక్షణ'),
    description: 'Warning signs of fraud: calls or messages asking for OTP, password, PIN or money to approve a pension or scheme; links to unknown websites; threats that your benefit will be stopped. Never share OTP or passwords. Government benefits do not need payment to a person for approval. Report cyber fraud on the National Cyber Crime Helpline 1930 or at cybercrime.gov.in.',
    eligibilityText: [], eligibilityRules: [], documents: [],
    procedure: ['Do not share OTP, password or PIN', 'Stop the call and do not pay', 'Check only on official government websites or at your local office', 'Call 1930 or visit cybercrime.gov.in to report'],
    keywords: ['scam', 'fraud', 'otp', 'safety', 'మోసం', 'ఓటీపీ', 'धोखा', 'ओटीपी'] },
];

await connectDB();
const created = [];
for (const s of sources) created.push(await KnowledgeSource.findOneAndUpdate({ name: s.name }, { ...s, approved: true }, { upsert: true, new: true }));
for (const { src, ...svc } of services) {
  const source = created[src];
  await GovernmentService.findOneAndUpdate({ slug: svc.slug }, { ...svc, source: source._id, sourceUrl: source.url, status: 'needs_verification', lastVerified: null }, { upsert: true });
}
if (!env.adminPassword || env.adminPassword.length < 10) { console.error('Set ADMIN_PASSWORD (10+ chars) in .env'); process.exit(1); }
await User.findOneAndUpdate({ email: env.adminEmail.toLowerCase() }, { name: 'Administrator', role: 'admin', passwordHash: await bcrypt.hash(env.adminPassword, 10), active: true }, { upsert: true });
console.log(`Seeded ${sources.length} sources, ${services.length} services (all NEEDS VERIFICATION), admin ${env.adminEmail}`);
process.exit(0);

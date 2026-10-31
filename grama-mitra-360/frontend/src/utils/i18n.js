const T = (en, hi, te) => ({ en, hi, te });
export const UI = {
  tagline: T('Beyond voice assistance – a smart digital companion for rural India', 'सिर्फ आवाज़ से आगे – ग्रामीण भारत का स्मार्ट डिजिटल साथी', 'కేవలం వాయిస్‌కి మించి – గ్రామీణ భారతానికి స్మార్ట్ డిజిటల్ సహచరుడు'),
  getStarted: T('Get started', 'शुरू करें', 'ప్రారంభించండి'),
  welcome: T('Namaste! How can I help you?', 'नमस्ते! मैं आपकी कैसे मदद करूं?', 'నమస్కారం! నేను మీకు ఎలా సహాయం చేయాలి?'),
  tapToSpeak: T('Tap and speak', 'दबाएं और बोलें', 'నొక్కి మాట్లాడండి'),
  listening: T('Listening…', 'सुन रहा हूं…', 'వింటున్నాను…'),
  youSaid: T('I heard', 'मैंने सुना', 'నేను విన్నది'),
  isCorrect: T('Is this correct?', 'क्या यह सही है?', 'ఇది సరైనదేనా?'),
  yes: T('Yes', 'हाँ', 'అవును'), no: T('No', 'नहीं', 'కాదు'),
  repeat: T('Repeat', 'दोबारा सुनें', 'మళ్లీ వినండి'),
  slow: T('Slow speech', 'धीमी आवाज़', 'నెమ్మదిగా'),
  typeHere: T('Or type here', 'या यहां लिखें', 'లేదా ఇక్కడ టైప్ చేయండి'),
  send: T('Send', 'भेजें', 'పంపండి'),
  thinking: T('Thinking…', 'सोच रहा हूं…', 'ఆలోచిస్తున్నాను…'),
  popular: T('Popular services', 'लोकप्रिय सेवाएं', 'ప్రముఖ సేవలు'),
  eligibility: T('Check eligibility', 'पात्रता जांचें', 'అర్హత తనిఖీ'),
  documents: T('Documents needed', 'ज़रूरी दस्तावेज़', 'అవసరమైన పత్రాలు'),
  voice: T('Talk to assistant', 'सहायक से बात करें', 'అసిస్టెంట్‌తో మాట్లాడండి'),
  human: T('Human support', 'मानव सहायता', 'మానవ సహాయం'),
  recent: T('Recently used', 'हाल में देखे', 'ఇటీవల చూసినవి'),
  official: T('Official source', 'आधिकारिक स्रोत', 'అధికారిక మూలం'),
  verifiedOn: T('Last verified', 'अंतिम सत्यापन', 'చివరిగా ధృవీకరించినది'),
  notVerifiedYet: T('Not yet verified', 'अभी सत्यापित नहीं', 'ఇంకా ధృవీకరించలేదు'),
  back: T('Back', 'वापस', 'వెనక్కి'),
  chooseScheme: T('Choose a scheme', 'योजना चुनें', 'పథకాన్ని ఎంచుకోండి'),
  online: T('Online', 'ऑनलाइन', 'ఆన్‌లైన్'), offline: T('Offline', 'ऑफ़लाइन', 'ఆఫ్‌లైన్'),
  needInternet: T('This needs internet.', 'इसके लिए इंटरनेट चाहिए।', 'దీనికి ఇంటర్నెట్ అవసరం.'),
  haveDoc: T('I have it', 'मेरे पास है', 'నా దగ్గర ఉంది'),
  checkMissing: T('Find missing documents', 'कमी वाले दस्तावेज़ देखें', 'లేని పత్రాలను చూడండి'),
  readAloud: T('Read aloud', 'पढ़कर सुनाएं', 'చదివి వినిపించండి'),
  explainMine: T('Explain in my language', 'मेरी भाषा में समझाएं', 'నా భాషలో వివరించండి'),
  missing: T('Missing', 'कमी', 'లేనివి'), available: T('Available', 'उपलब्ध', 'ఉన్నవి'),
  preliminary_match: T('Possible match – this is NOT an approval', 'संभावित पात्र – यह मंजूरी नहीं है', 'అర్హత ఉండవచ్చు – ఇది ఆమోదం కాదు'),
  may_not_be_eligible: T('You may not be eligible', 'शायद आप पात्र नहीं हैं', 'మీకు అర్హత లేకపోవచ్చు'),
  needs_more_info: T('More information is needed', 'और जानकारी चाहिए', 'మరింత సమాచారం కావాలి'),
  disclaimer: T('Final approval is decided only by the government.', 'अंतिम मंजूरी सिर्फ सरकार देती है।', 'తుది ఆమోదం ప్రభుత్వమే ఇస్తుంది.'),
  saveAnon: T('Save my answers without my name (optional)', 'मेरे उत्तर बिना नाम के सहेजें (वैकल्पिक)', 'నా సమాధానాలను పేరు లేకుండా సేవ్ చేయండి (ఐచ్ఛికం)'),
  consentTicket: T('I agree to save this request so a support person can read it', 'मैं सहमत हूं कि यह अनुरोध सहेजा जाए ताकि सहायता कर्मी इसे पढ़ सकें', 'సహాయ సిబ్బంది చదవడానికి ఈ అభ్యర్థనను సేవ్ చేయడానికి నేను అంగీకరిస్తున్నాను'),
  contactOpt: T('Phone number (optional)', 'फ़ोन नंबर (वैकल्पिक)', 'ఫోన్ నంబర్ (ఐచ్ఛికం)'),
  submitReq: T('Send request', 'अनुरोध भेजें', 'అభ్యర్థన పంపండి'),
  ticketId: T('Your ticket ID', 'आपका टिकट आईडी', 'మీ టికెట్ ID'),
  trackStatus: T('Check status', 'स्थिति देखें', 'స్థితి చూడండి'),
  close: T('Close', 'बंद करें', 'మూసివేయండి'),
  notSupported: T('Voice input is not supported in this browser. Please type instead (Chrome works best).', 'इस ब्राउज़र में आवाज़ इनपुट नहीं चलता। कृपया लिखें (Chrome बेहतर है)।', 'ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ పనిచేయదు. దయచేసి టైప్ చేయండి (Chrome ఉత్తమం).'),
  noVoice: T('This device has no voice for your language, so answers may not be read aloud.', 'इस डिवाइस में आपकी भाषा की आवाज़ नहीं है, इसलिए उत्तर पढ़कर नहीं सुनाए जा सकते।', 'ఈ పరికరంలో మీ భాషకు వాయిస్ లేదు, కాబట్టి సమాధానాలు చదివి వినిపించకపోవచ్చు.'),
  didntCatch: T('I could not understand your answer. Please use the buttons.', 'मैं आपका उत्तर समझ नहीं पाया। कृपया बटन दबाएं।', 'మీ సమాధానం అర్థం కాలేదు. దయచేసి బటన్లు నొక్కండి.'),
};
export const t = (lang, key) => UI[key]?.[lang] ?? UI[key]?.en ?? key;
export const LANG_NAMES = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు' };
const YES = ['yes', 'yeah', 'yep', 'haan', 'han', 'ha', 'हाँ', 'हां', 'जी', 'అవును', 'ఉంది', 'ఉన్నాయి', 'ఆ'];
const NO = ['no', 'nahi', 'nahin', 'नहीं', 'नही', 'కాదు', 'లేదు', 'లేవు'];
export function parseYesNo(s = '') {
  const w = s.toLowerCase().split(/[\s,.!?]+/);
  if (w.some(x => NO.includes(x))) return false;
  if (w.some(x => YES.includes(x))) return true;
  return null;
}
export function parseNumber(s = '') {
  const m = s.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d)).match(/\d{1,3}/);
  return m ? Number(m[0]) : null;
}

Object.assign(UI, {
  offlineHelp: T('Offline help', 'ऑफ़लाइन मदद', 'ఆఫ్‌లైన్ సహాయం'),
  scamSafety: T('Scam safety', 'धोखाधड़ी से बचाव', 'మోసాల నుండి రక్షణ'),
  verifiedInfo: T('Verified information', 'सत्यापित जानकारी', 'ధృవీకరించిన సమాచారం'),
  savedOffline: T('Saved on this phone. It will be sent when internet returns, and then you will get a ticket ID.', 'यह फ़ोन में सहेजा गया है। इंटरनेट आने पर भेजा जाएगा, तब आपको टिकट आईडी मिलेगा।', 'ఇది ఫోన్‌లో సేవ్ అయింది. ఇంటర్నెట్ వచ్చినప్పుడు పంపబడుతుంది, అప్పుడు మీకు టికెట్ ID వస్తుంది.'),
  examples: T('Try an example', 'उदाहरण आज़माएं', 'ఉదాహరణ ప్రయత్నించండి'),
});
export const EXAMPLES = {
  te: ['అన్నా నాకు పింఛన్ ఎట్లా వస్తది?', 'రేషన్ కార్డుకి ఏ పత్రాలు కావాలి?', 'ఎవరో ఫోన్ చేసి పింఛన్ కోసం డబ్బులు అడిగారు, ఇది నిజమేనా?', 'Pension కి apply ఎలా చేయాలి?'],
  hi: ['मुझे वृद्धावस्था पेंशन कैसे मिलेगी?', 'राशन कार्ड के लिए कौन से दस्तावेज़ चाहिए?', 'किसी ने पेंशन के लिए पैसे मांगे, क्या यह सही है?', 'Mujhe scholarship ka form kaise bharna hai'],
  en: ['I want an old-age pension', 'What documents are required for a ration card?', 'Someone called me and asked for money to approve my pension. Is this genuine?', 'How do I get the free scooter scheme?'],
};

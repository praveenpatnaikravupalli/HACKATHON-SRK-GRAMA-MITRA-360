export const LANGS = { en: 'English', hi: 'Hindi', te: 'Telugu' };
export const MSG = {
  unverified: {
    en: 'I could not verify this information. Would you like to speak with a human support representative?',
    hi: 'मैं इस जानकारी की पुष्टि नहीं कर सका। क्या आप किसी सहायता प्रतिनिधि से बात करना चाहेंगे?',
    te: 'ఈ సమాచారాన్ని నేను ధృవీకరించలేకపోయాను. మీరు మానవ సహాయ ప్రతినిధితో మాట్లాడాలనుకుంటున్నారా?',
  },
  repeat: {
    en: 'I did not understand clearly. Please say it again.',
    hi: 'मुझे ठीक से समझ नहीं आया। कृपया फिर से बोलें।',
    te: 'నాకు సరిగ్గా అర్థం కాలేదు. దయచేసి మళ్లీ చెప్పండి.',
  },
  mediumNote: {
    en: 'Note: this information still needs extra checking. Please confirm at the official website.',
    hi: 'ध्यान दें: इस जानकारी की और जांच होनी बाकी है। कृपया आधिकारिक वेबसाइट पर पुष्टि करें।',
    te: 'గమనిక: ఈ సమాచారాన్ని ఇంకా తనిఖీ చేయాలి. దయచేసి అధికారిక వెబ్‌సైట్‌లో నిర్ధారించుకోండి.',
  },
  confirm: {
    en: (t) => `I heard: "${t}". Is this correct?`,
    hi: (t) => `मैंने सुना: "${t}"। क्या यह सही है?`,
    te: (t) => `నేను విన్నది: "${t}". ఇది సరైనదేనా?`,
  },
  safetyBase: {
    en: 'Never share your OTP, password or PIN with anyone. Real government offices do not ask for money over phone calls to approve a pension or scheme. Check only on official government websites, or call the National Cyber Crime Helpline 1930.',
    hi: 'अपना ओटीपी, पासवर्ड या पिन किसी को न बताएं। असली सरकारी कार्यालय पेंशन या योजना मंजूर करने के लिए फोन पर पैसे नहीं मांगते। केवल सरकारी वेबसाइट पर जांचें, या राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर फोन करें।',
    te: 'మీ ఓటీపీ, పాస్‌వర్డ్ లేదా పిన్ ఎవరికీ చెప్పకండి. అసలైన ప్రభుత్వ కార్యాలయాలు పెన్షన్ లేదా పథకం మంజూరు కోసం ఫోన్‌లో డబ్బు అడగవు. అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లలో మాత్రమే చూడండి, లేదా జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్ 1930కి కాల్ చేయండి.',
  },
};
export const lang = (l) => (['en', 'hi', 'te'].includes(l) ? l : 'en');

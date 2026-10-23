import type { DemoScenario } from '@/content/agents/demo-types';

// EXACTLY eight scripted scenarios (amendment A4). Every business is fictional and every
// conversation is labelled as a simulation wherever it is shown. Voice scripts open with the AI
// disclosure. No prices are quoted: money, allowances and VAT come only from pricing config.
// Phone numbers use the Ofcom reserved drama range (07700 900xxx).

export const demoScenarios: readonly DemoScenario[] = [
  {
    id: 'general-voice',
    channel: 'voice',
    industry: 'general',
    title: 'A call to a small business',
    fictionalBusiness: 'Example Business',
    turns: [
      { speaker: 'system', text: 'Incoming call to Example Business (simulated).' },
      {
        speaker: 'ai',
        text: 'Hello, you have reached Example Business. I am an AI assistant, and this call may be recorded. How can I help?',
      },
      { speaker: 'caller', text: 'Hi, what time do you open on Saturdays?' },
      {
        speaker: 'ai',
        text: 'On Saturdays we are open from nine until one. Would you like someone to call you back about a visit?',
      },
      { speaker: 'caller', text: 'Yes please, sometime on Monday.' },
      { speaker: 'ai', text: 'Of course. Can I take your name and the best number to reach you?' },
      { speaker: 'caller', text: 'Sam Carter, 07700 900123.' },
      {
        speaker: 'ai',
        text: 'Thank you, Sam. I have asked the team to call you on 07700 900123 on Monday morning. Is there anything else?',
      },
      { speaker: 'caller', text: 'No, that is all.' },
      { speaker: 'ai', text: 'Thanks for calling Example Business. Goodbye.' },
    ],
    summary:
      'Caller: Sam Carter\nPhone: 07700 900123\nRequest: Callback about a Saturday visit\nPreferred time: Monday morning\nNext step: The team calls back',
  },
  {
    id: 'general-whatsapp',
    channel: 'whatsapp',
    industry: 'general',
    title: 'A WhatsApp enquiry to a small business',
    fictionalBusiness: 'Example Business',
    turns: [
      { speaker: 'system', text: 'Today 10:42 (simulated)' },
      { speaker: 'caller', text: 'Hello, do you offer evening appointments?' },
      {
        speaker: 'ai',
        text: 'Hello, this is the Example Business assistant. I am an AI assistant. Evening appointments are available on Tuesdays and Thursdays until seven.',
      },
      { speaker: 'caller', text: 'Great. Can I book next Tuesday?' },
      {
        speaker: 'ai',
        text: 'I can pass a request to the team. What name should I put it under, and what time would you like?',
      },
      { speaker: 'caller', text: 'Maya Brooks, around half past five.' },
      {
        speaker: 'ai',
        text: 'Thank you, Maya. I have requested next Tuesday at half past five. The team will confirm here or by phone.',
      },
      { speaker: 'caller', text: 'Perfect, thanks.' },
      { speaker: 'ai', text: 'You are welcome. Is there anything else I can help with?' },
    ],
    summary:
      'Customer: Maya Brooks\nRequest: Evening appointment\nPreferred time: Next Tuesday, around 5:30 pm\nNext step: The team confirms by message or phone',
    quickReplies: [
      { label: 'See a dental practice example', nextScenarioId: 'clinics-whatsapp' },
      { label: 'See an estate agent example', nextScenarioId: 'estate-agents-whatsapp' },
      { label: 'See a heating and plumbing example', nextScenarioId: 'home-services-whatsapp' },
    ],
  },
  {
    id: 'clinics-voice',
    channel: 'voice',
    industry: 'clinics',
    title: 'A check-up request, then an emergency mention',
    fictionalBusiness: 'Meadowbank Dental Practice',
    turns: [
      { speaker: 'system', text: 'Incoming call to Meadowbank Dental Practice (simulated).' },
      {
        speaker: 'ai',
        text: 'Hello, this is Meadowbank Dental Practice. I am an AI assistant, and this call may be recorded. How can I help you today?',
      },
      { speaker: 'caller', text: 'Hi, I would like a check-up sometime next week.' },
      {
        speaker: 'ai',
        text: 'Happy to help. Are you already a patient with us, or would this be your first visit?',
      },
      { speaker: 'caller', text: 'I am already a patient.' },
      {
        speaker: 'ai',
        text: 'Thanks. I can offer Tuesday at ten past nine, or Thursday at half past two. Which suits you better?',
      },
      { speaker: 'caller', text: 'Thursday works.' },
      { speaker: 'ai', text: 'Lovely. Can I take your full name and a mobile number?' },
      { speaker: 'caller', text: 'Hannah Reid, 07700 900456.' },
      {
        speaker: 'ai',
        text: 'Thank you, Hannah. I have requested Thursday at half past two for a check-up. The practice will confirm by email. Is there anything else?',
      },
      {
        speaker: 'caller',
        text: 'Actually, my son woke up with his face badly swollen this morning.',
      },
      {
        speaker: 'ai',
        text: 'I am sorry to hear that. I cannot give medical advice. If the swelling is severe, or he is struggling to breathe or swallow, please call 999 now. For urgent advice you can call NHS 111. I am alerting the practice on-call line as well.',
      },
      { speaker: 'caller', text: 'Okay, thank you.' },
      { speaker: 'ai', text: 'Please look after him. The practice has been alerted. Goodbye.' },
    ],
    summary:
      'Caller: Hannah Reid (existing patient)\nMobile: 07700 900456\nRequest: Check-up, Thursday at 2:30 pm (the practice confirms)\nFlag: Caller mentioned severe facial swelling. Directed to NHS 111 and 999. On-call line alerted',
  },
  {
    id: 'clinics-whatsapp',
    channel: 'whatsapp',
    industry: 'clinics',
    title: 'A new patient asks about a hygienist appointment',
    fictionalBusiness: 'Meadowbank Dental Practice',
    turns: [
      { speaker: 'system', text: 'Today 11:05 (simulated)' },
      { speaker: 'caller', text: 'Hi, are you open on Saturdays?' },
      {
        speaker: 'ai',
        text: 'Hello, this is the Meadowbank Dental Practice assistant. I am an AI assistant. We are open Saturday mornings by appointment.',
      },
      { speaker: 'caller', text: 'Can I book a hygienist appointment for this Saturday?' },
      { speaker: 'ai', text: 'I can request that for you. Are you a new or an existing patient?' },
      { speaker: 'caller', text: 'New patient.' },
      {
        speaker: 'ai',
        text: 'Welcome. I can request Saturday at quarter past nine or half past ten. Which would you like?',
      },
      { speaker: 'caller', text: 'Quarter past nine please. My name is Tom Whitfield.' },
      { speaker: 'ai', text: 'Thanks, Tom. What is the best phone number and email for you?' },
      { speaker: 'caller', text: '07700 900789, tom@example.com' },
      {
        speaker: 'ai',
        text: 'Thank you. I have requested Saturday at quarter past nine with the hygienist as a new patient. The practice will confirm by email. If you have severe pain or swelling before then, call NHS 111, or 999 in an emergency.',
      },
    ],
    summary:
      'Patient: Tom Whitfield (new patient)\nPhone: 07700 900789\nEmail: tom@example.com\nRequest: Hygienist, Saturday at 9:15 am (the practice confirms)',
  },
  {
    id: 'estate-agents-voice',
    channel: 'voice',
    industry: 'estate-agents',
    title: 'A seller asks for a valuation',
    fictionalBusiness: 'Harbour Lane Lettings and Sales',
    turns: [
      { speaker: 'system', text: 'Incoming call to Harbour Lane Lettings and Sales (simulated).' },
      {
        speaker: 'ai',
        text: 'Hello, Harbour Lane Lettings and Sales. I am an AI assistant, and this call may be recorded. How can I help?',
      },
      { speaker: 'caller', text: 'I am thinking of selling my flat. What is it worth?' },
      {
        speaker: 'ai',
        text: 'I cannot give a valuation, because that needs one of our sales team to see the property. I can request a valuation visit for you.',
      },
      { speaker: 'caller', text: 'Okay. When is the next one available?' },
      {
        speaker: 'ai',
        text: 'I can offer Monday at eleven or Wednesday at four. Which would you prefer?',
      },
      { speaker: 'caller', text: 'Wednesday.' },
      { speaker: 'ai', text: 'Could I take your name, the property address and a phone number?' },
      {
        speaker: 'caller',
        text: 'Rosa Lindqvist, Flat 3, 22 Harbour Row, and 07700 900654.',
      },
      {
        speaker: 'ai',
        text: 'Thanks, Rosa. I have requested Wednesday at four for a valuation visit at Flat 3, 22 Harbour Row. The sales team will confirm. Is there anything else?',
      },
      { speaker: 'caller', text: 'Can you tell me what price I should list it at?' },
      {
        speaker: 'ai',
        text: 'I am not able to advise on pricing. The sales team can talk it through with you at the visit.',
      },
      { speaker: 'caller', text: 'Fine, thank you.' },
      { speaker: 'ai', text: 'Thank you for calling Harbour Lane. Goodbye.' },
    ],
    summary:
      'Caller: Rosa Lindqvist (owner)\nPhone: 07700 900654\nProperty: Flat 3, 22 Harbour Row\nRequest: Valuation visit, Wednesday at 4 pm (the sales team confirms)\nNote: Asked for pricing advice, referred to the visit',
  },
  {
    id: 'estate-agents-whatsapp',
    channel: 'whatsapp',
    industry: 'estate-agents',
    title: 'A viewing request, then a boiler fault',
    fictionalBusiness: 'Harbour Lane Lettings and Sales',
    turns: [
      { speaker: 'system', text: 'Today 18:42 (simulated)' },
      { speaker: 'caller', text: 'Hi, is the two-bedroom flat on Quay Street still available?' },
      {
        speaker: 'ai',
        text: 'Hello, this is the Harbour Lane Lettings and Sales assistant. I am an AI assistant. The listing feed shows the two-bedroom flat on Quay Street as available to let. Would you like to arrange a viewing?',
      },
      {
        speaker: 'caller',
        text: 'Yes. Can I see it on Saturday? My budget is around fourteen hundred a month.',
      },
      {
        speaker: 'ai',
        text: 'I can request Saturday at eleven. I cannot negotiate the rent, which is shown on the listing. Are you looking to rent, or are you a landlord?',
      },
      {
        speaker: 'caller',
        text: 'Looking to rent. I would like to move by the end of next month.',
      },
      { speaker: 'ai', text: 'Thanks. Can I take your name, mobile and email?' },
      { speaker: 'caller', text: 'Daniel Okafor, 07700 900321, daniel@example.com' },
      {
        speaker: 'ai',
        text: 'Thank you, Daniel. I have requested a viewing on Saturday at eleven and noted your budget and move date.',
      },
      {
        speaker: 'caller',
        text: 'Also, I rent from you at 8 Mill Lane and my boiler has stopped working.',
      },
      {
        speaker: 'ai',
        text: 'I am sorry to hear that. Do you have heating and hot water at the moment, and can you smell gas?',
      },
      { speaker: 'caller', text: 'No heating or hot water. No gas smell.' },
      {
        speaker: 'ai',
        text: 'Thanks. I have logged a boiler fault for 8 Mill Lane as urgent and passed it to the maintenance contact. If you ever smell gas, leave the property and call the National Gas Emergency Service on 0800 111 999. Outside office hours, use the out-of-hours number in your tenancy information.',
      },
    ],
    summary:
      'Enquiry: Daniel Okafor, 07700 900321, daniel@example.com\nRequest: Viewing of the Quay Street flat, Saturday at 11:00\nNotes: Renting (not a landlord), budget and move date recorded\nMaintenance: Boiler fault logged for 8 Mill Lane, marked urgent, passed to the maintenance contact',
  },
  {
    id: 'home-services-voice',
    channel: 'voice',
    industry: 'home-services',
    title: 'No hot water, then a gas smell',
    fictionalBusiness: 'Pennant Heating and Plumbing',
    turns: [
      { speaker: 'system', text: 'Incoming call to Pennant Heating and Plumbing (simulated).' },
      {
        speaker: 'ai',
        text: 'Hello, Pennant Heating and Plumbing. I am an AI assistant, and this call may be recorded. What can I help with?',
      },
      { speaker: 'caller', text: 'I have no hot water and the boiler is clicking.' },
      {
        speaker: 'ai',
        text: 'Sorry to hear that. First, a quick safety question: can you smell gas?',
      },
      { speaker: 'caller', text: 'No, no gas smell.' },
      { speaker: 'ai', text: 'Thank you. Can I take your address and postcode?' },
      { speaker: 'caller', text: '14 Beech Avenue, ZZ99 9ZZ.' },
      {
        speaker: 'ai',
        text: 'Thanks. Is anyone vulnerable at home, such as young children or someone elderly?',
      },
      { speaker: 'caller', text: 'My elderly mother lives with me.' },
      {
        speaker: 'ai',
        text: 'Understood, I will mark this as a priority. When is someone home, and what time suits you?',
      },
      { speaker: 'caller', text: 'I work from home, so mornings are best.' },
      {
        speaker: 'ai',
        text: 'I will put this on the engineer callback list as a priority, mornings preferred. I cannot quote a price on the phone, so the engineer will go through that with you. Anything else?',
      },
      { speaker: 'caller', text: 'Actually, I can smell gas near the boiler now.' },
      {
        speaker: 'ai',
        text: 'Please leave the property now and call the National Gas Emergency Service on 0800 111 999 straight away. Do not wait for us. I am flagging this to the owner right now.',
      },
    ],
    summary:
      'Caller: Name not given on the call\nAddress: 14 Beech Avenue, ZZ99 9ZZ\nProblem: No hot water, boiler clicking\nUrgency: Priority, elderly person at home, mornings preferred\nFlag: Caller then reported a gas smell. Directed to the National Gas Emergency Service. Owner alerted immediately',
  },
  {
    id: 'home-services-whatsapp',
    channel: 'whatsapp',
    industry: 'home-services',
    title: 'A dripping tap and a quote callback',
    fictionalBusiness: 'Pennant Heating and Plumbing',
    turns: [
      { speaker: 'system', text: 'Today 08:15 (simulated)' },
      {
        speaker: 'caller',
        text: 'Morning, my kitchen tap is dripping constantly. Can someone fix it?',
      },
      {
        speaker: 'ai',
        text: 'Morning. This is the Pennant Heating and Plumbing assistant. I am an AI assistant. I can take the job details for the team. Is water running freely, or is it only dripping?',
      },
      { speaker: 'caller', text: 'Only dripping.' },
      { speaker: 'ai', text: 'Thanks. Could you send your address and postcode?' },
      { speaker: 'caller', text: '9 Orchard Close, ZZ99 9ZZ' },
      { speaker: 'ai', text: 'Got it. Is it urgent, or would the next few days be fine?' },
      { speaker: 'caller', text: 'The next few days is fine. How much will it cost?' },
      {
        speaker: 'ai',
        text: 'I cannot quote a price here, because it depends on the tap and the work. I will add you to the quote callback list. What is the best number and time?',
      },
      { speaker: 'caller', text: '07700 900987, after four in the afternoon.' },
      {
        speaker: 'ai',
        text: 'Thank you. I have requested a callback after four with the team. Is there anything else I can help with?',
      },
      { speaker: 'caller', text: 'No, that is everything. Thanks.' },
    ],
    summary:
      'Customer phone: 07700 900987\nAddress: 9 Orchard Close, ZZ99 9ZZ\nJob: Dripping kitchen tap\nUrgency: Next few days\nRequest: Quote callback after 4 pm',
  },
];

export function getScenario(id: string): DemoScenario | undefined {
  return demoScenarios.find((scenario) => scenario.id === id);
}

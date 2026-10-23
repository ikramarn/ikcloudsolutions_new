import { sharedFaq } from '@/content/faq';
import type { CopyContext, FaqItem } from '@/lib/copy/faq';

// Every figure below is produced from the copy context (A1). Nothing typed here is a price,
// allowance, overage rate, discount or VAT phrase.
const count = (value: number): string => value.toLocaleString('en-GB');

function allowanceSummary(c: CopyContext): string {
  return c.pricing.plans
    .map((plan) => {
      const { voiceMinutes, whatsappAiReplies } = plan.allowances;
      return plan.channels === 'voice-and-whatsapp'
        ? `${plan.name}: ${count(voiceMinutes)} voice minutes and ${count(whatsappAiReplies)} AI WhatsApp replies a month`
        : `${plan.name}: ${count(voiceMinutes)} voice minutes if you choose voice, or ${count(whatsappAiReplies)} AI WhatsApp replies if you choose WhatsApp, a month`;
    })
    .join('. ');
}

function overageSentence(c: CopyContext): string {
  const plan = c.pricing.plans[0];
  return `Extra voice minutes cost ${c.unitRate(plan.overage.voicePerMinuteTenthsPence.GBP)} each and extra AI WhatsApp replies cost ${c.unitRate(plan.overage.whatsappPerReplyTenthsPence.GBP)} each.`;
}

const startingPrice: FaqItem = {
  id: 'cost',
  question: 'How much does the AI Front Desk cost?',
  answer: (c) =>
    `Plans start from ${c.displayPrice('starter', 'monthly')}, plus a one-time setup fee if you want us to build it. See {{link:/ai-agents/pricing|the pricing page}} for the full breakdown. ${c.vatPhrase}`,
};

export const hubFaq: readonly FaqItem[] = [
  {
    id: 'what-is-it',
    question: 'What is the AI Front Desk?',
    answer:
      'A managed AI receptionist for your phone line and your WhatsApp number. We set it up, run it and improve it every month. It answers, captures details, books where it can and hands over to a person when it should.',
  },
  sharedFaq.aiDisclosure,
  startingPrice,
  sharedFaq.website,
  sharedFaq.metaFees,
  sharedFaq.emergencies,
  sharedFaq.handover,
  sharedFaq.ukNumber,
  {
    id: 'go-live',
    question: 'How long does it take to go live?',
    answer: (c) =>
      `It depends on the package. As a guide, ${c.pricing.setupPackages
        .map((pack) => `${pack.name} is ${pack.typicalTimeline.replace(/^Indicative: /, '')}`)
        .join(', ')}. These timelines are indicative, not promises.`,
  },
];

export const pricingFaq: readonly FaqItem[] = [
  {
    id: 'allowances',
    question: 'What is included each month?',
    answer: (c) =>
      `Voice minutes and AI WhatsApp replies are counted separately. ${allowanceSummary(c)}.`,
  },
  {
    id: 'overage',
    question: 'What happens if I go over my allowance?',
    answer: (c) => `${overageSentence(c)} ${c.vatPhrase}`,
  },
  {
    id: 'limits',
    question: 'Does the agent stop when I reach the limit?',
    answer:
      'No. We warn you as you approach your allowance, and anything above it is charged at the overage rates. The agent keeps working.',
  },
  {
    id: 'annual',
    question: 'How does annual billing work?',
    answer: (c) =>
      `Annual billing takes ${c.pricing.annualDiscountPercent} per cent off the plan fee and is paid up front for twelve months. Add-ons are not discounted.`,
  },
  {
    id: 'cancel',
    question: 'Can I cancel?',
    answer:
      'You can cancel with notice. The exact terms will be in our {{link:/refund-and-cancellation|refund and cancellation policy}}, which is currently a draft.',
  },
  {
    id: 'vat',
    question: 'Are prices shown with VAT?',
    answer: (c) => `${c.vatPhrase} The note after each price tells you which applies.`,
  },
  sharedFaq.metaFees,
  {
    id: 'change-plan',
    question: 'Can I change plan later?',
    answer:
      'Yes. Ask us and we will confirm how and when the change applies, because it depends on whether you pay monthly or annually.',
  },
];

export const voiceFaq: readonly FaqItem[] = [
  sharedFaq.aiDisclosure,
  {
    id: 'recording',
    question: 'Are calls recorded?',
    answer:
      'Only if you choose recording. When a call is recorded, the assistant tells the caller at the start. Recordings are handled as described in our {{link:/privacy|privacy policy}}.',
  },
  sharedFaq.ukNumber,
  sharedFaq.handover,
  {
    id: 'languages',
    question: 'Which languages does it speak?',
    answer:
      'English first. Additional languages are planned and shown as coming soon on the pricing page.',
  },
  sharedFaq.emergencies,
];

export const whatsappFaq: readonly FaqItem[] = [
  {
    id: 'service-window',
    question: 'What is the 24-hour service window?',
    answer:
      'WhatsApp lets a business reply freely for 24 hours after a customer last messages. After that, only approved template messages can be sent. We set up the templates you need.',
  },
  sharedFaq.metaFees,
  {
    id: 'verification',
    question: 'What is Meta business verification?',
    answer:
      'Meta checks that your business is real before it allows some WhatsApp features. We can help you complete the process, but Meta decides the outcome and it can take days to weeks.',
  },
  sharedFaq.handover,
  {
    id: 'own-customers',
    question: 'Can it message people who have not contacted me?',
    answer:
      'No. It is for replying to your own customers who message you. It is not a tool for marketing messages.',
  },
];

export const howItWorksFaq: readonly FaqItem[] = [
  {
    id: 'what-we-need',
    question: 'What do you need from me?',
    answer:
      'Your business name and address, opening hours, services, booking rules, who to alert for urgent matters, your tone of voice and the questions customers ask most. {{link:/ai-agents/done-for-you|The done-for-you page}} has the full checklist.',
  },
  sharedFaq.handover,
  {
    id: 'never-does',
    question: 'What will the AI not do?',
    answer:
      'It answers only from facts you approve and says when it does not know. It does not give legal, medical or financial advice, handle emergencies, negotiate or make promises you have not authorised.',
  },
  {
    id: 'data',
    question: 'How are recordings and data handled?',
    answer:
      'We keep the details callers give to pass them to you and to improve your agent. How we handle personal data is described in our {{link:/privacy|privacy policy}} and the {{link:/dpa-summary|data processing summary}}, both currently drafts.',
  },
  {
    id: 'improvements',
    question: 'How is the agent improved over time?',
    answer:
      'We review conversations each month, fix gaps in the knowledge base and adjust handover rules. Larger changes are quoted before we start.',
  },
];

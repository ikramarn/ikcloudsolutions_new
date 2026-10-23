# Accessibility checklist

The target is WCAG 2.2 level AA. Automated checks catch a part of that; the rest needs a person.
This file says what is automated, what is manual, and how to do the manual pass before a release.

Passing the automated checks does not prove the site is accessible. A full conformance claim needs
testing with assistive technology and an expert review, neither of which this repository does.

## Automated (runs in `npm run check` and `npm run test:e2e`)

| Check                                                                                                                                                                  | Where                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `eslint-plugin-jsx-a11y` rules through `eslint-config-next`                                                                                                            | `npm run lint`                                                |
| axe-core on `/`, `/ai-agents`, `/ai-agents/pricing`, `/ai-agents/get-started`, `/contact`, `/cookies` and the consultation dialog; fails on serious or critical issues | `tests/e2e/a11y.spec.ts`                                      |
| No horizontal scrolling at 360, 768, 1280 and 1920 pixels wide, on every page                                                                                          | `tests/e2e/routes.spec.ts`                                    |
| Mega menu works by keyboard; Escape returns focus to the button; the mobile drawer closes on Escape and returns focus                                                  | `tests/e2e/nav.spec.ts`                                       |
| Both simulated demos finish by keyboard; reduced motion shows the whole transcript at once                                                                             | `tests/e2e/demo.spec.ts`                                      |
| Error summaries take focus; the step heading takes focus in the request wizard                                                                                         | `tests/components/*`, `tests/e2e/lead.spec.ts`                |
| The site still renders when browser storage is blocked, and when the spam check cannot load                                                                            | `tests/e2e/resilience.spec.ts`, `tests/e2e/turnstile.spec.ts` |
| Every page, dialog and wizard step has no password inputs and no payment inputs                                                                                        | `tests/e2e/routes.spec.ts`, `tests/e2e/lead.spec.ts`          |

## Manual pass before each release

Use a real browser on a built site (`npm run build`, `npm run start`). Tick each item for the pages
listed: home, AI Agents, pricing, get started (all six steps), contact, cookies.

### Keyboard

- [ ] Tab order follows the visual order and nothing is skipped or trapped.
- [ ] "Skip to main content" is the first stop and moves focus to the page content.
- [ ] Focus is always visible, including on the cookie banner and inside dialogs.
- [ ] The AI Agents menu opens with Enter or Space, Tab walks its links, Escape closes it and
      returns focus to its button.
- [ ] Dialogs (consultation, lesson player, mobile menu) trap focus, close on Escape and return
      focus to the control that opened them.
- [ ] The pricing toggle changes with the arrow keys.
- [ ] Wide tables (add-ons, overage) can be scrolled with the keyboard.
- [ ] The request wizard can be completed without a mouse. Pressing Enter before the last step
      moves on and never sends the request.

### Zoom and reflow

- [ ] At 200% zoom nothing is cut off or overlaps.
- [ ] At 400% zoom (a 320 pixel wide window) content reflows into one column with no sideways
      scrolling, apart from tables inside their own scroll area.
- [ ] Text spacing overrides (line height 1.5, letter spacing 0.12em) do not hide any text.

### Screen reader

Run a quick smoke test with NVDA on Windows (Firefox or Chrome) or VoiceOver on macOS and iOS.

- [ ] Each page has one `h1`, and the headings make sense when listed.
- [ ] Landmarks are announced: banner, navigation (Primary, and each footer group), main,
      contentinfo.
- [ ] Form fields announce their label, whether they are required and any error. The error summary
      is announced when it appears.
- [ ] The cookie banner is reachable and its two choices are announced as buttons.
- [ ] The simulated demos announce that they are simulated, and the transcript updates politely.
- [ ] The pricing cards read as: plan name, price, billing note, then two separate allowance lines
      (voice minutes and AI WhatsApp replies).
- [ ] The estimate panel in the request wizard is announced as a region named "Your estimate".

### Motion, colour and media

- [ ] With the system "reduce motion" setting on, nothing animates and the demos show their full
      transcript.
- [ ] Information is never carried by colour alone (demo speakers are named in text).
- [ ] Text and interactive controls meet the contrast ratios (4.5:1 for text, 3:1 for large text and
      for control boundaries). Check the cookie banner and the glass panels on the lightest part of
      the background.
- [ ] Touch targets are at least 24 by 24 CSS pixels (the site aims for 44) on a phone.
- [ ] No audio plays on any page. The Academy sample videos do not autoplay.

### Known gaps to report to the owner

- The Academy sample videos have no captions or transcript and are third-party placeholders. The
  page says so.
- Real assistive-technology testing has not been done by this repository's automation.

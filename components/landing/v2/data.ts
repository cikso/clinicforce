// Per-vertical content dictionary for the landing v2 page.
// Lifted verbatim from the Claude Design handoff so copy stays identical.
// Headlines + integrations contain HTML fragments (accent spans, <b> tags)
// and are rendered via dangerouslySetInnerHTML in the component.

export type VerticalKey = 'all' | 'vet' | 'dental' | 'gp' | 'chiro'

export interface Vertical {
  headline:     string // HTML — contains .accent spans
  sub:          string
  mono:         string
  badge:        string
  integrations: string // HTML — contains <b>
  callers:      string[]
  bookings:     string[]
  smses:        string[]
  sec1H: string
  sec1B: string
  sec2H: string
  sec2B: string
  sec3H: string
  sec3B: string
  sec4H: string
  sec4B: string
  sec4B2: string
}

export const VERTICALS: Record<VerticalKey, Vertical> = {
  all: {
    headline: 'Every <span class="accent">clinic</span> call.<br>Every booking.<br><span class="accent">Zero missed.</span>',
    sub: "Purpose-built for veterinary, dental, general practice, and chiropractic clinics. Stella answers every call like your best receptionist would — books into your clinic software, triages urgency, and hands your team a structured clinical handover.",
    mono: 'Four clinic types.  One AI receptionist.  Not a general AI.',
    badge: 'Stella now triages urgency across every clinic type',
    integrations: 'Integrates with <b>ezyVet</b> · <b>Dental4Windows</b> · <b>Best Practice</b> · <b>Cliniko</b> · <b>12+ more</b>',
    callers: ['Margaret Thompson', 'James Wilson', 'Rebecca Chen', 'David Kim'],
    bookings: ['Bella · Vet emergency', 'James · Dental urgent', 'Rebecca · GP urgent', 'David · Chiro flare-up'],
    smses:    ['Bella triaged · vet ER', 'James booked · 4:15', 'Rebecca booked · 2:30', 'David booked · 9:00'],
    sec1H: "Stella picks up every call — day, night, and public holidays.",
    sec1B: "Your existing number forwards to Stella on the rings you choose. She greets callers in your clinic's voice, listens, and has a real conversation — no menu trees, no \"press 1 for bookings\".",
    sec2H: "Stella reads your calendar and books directly into open slots.",
    sec2B: "She sees which clinicians have availability and which don't. She confirms the right slot with the caller, writes it into your schedule, and sends an SMS confirmation before they hang up.",
    sec3H: "Appointments confirmed before they happen. No-shows down to near zero.",
    sec3B: "SMS reminders go out 24 hours and 2 hours before each appointment — with a one-tap YES / RESCHEDULE. Automated recalls tuned to your clinic type keep your books full without a single reminder phone call.",
    sec4H: "Turn happy patients into 5-star Google Reviews — automatically.",
    sec4B: "Every appointment triggers a two-question SMS survey. Promoters (4–5 stars) get a one-tap link that posts straight to your Google Business page — so your best patients build your reputation for you.",
    sec4B2: "If someone scores you below a 7, we auto-create a follow-up task and route it to the right clinician. You get to the call before they get to Google Reviews — turning a near-miss into a loyal patient.",
  },
  vet: {
    headline: 'Every <span class="accent">vet</span> call.<br>Every booking.<br><span class="accent">Zero missed.</span>',
    sub: "Stella answers every call like your best receptionist would — books into your vet software, triages emergencies, and hands your team a structured clinical handover. Trained on thousands of vet calls.",
    mono: 'Purpose-built for veterinary clinics. Not a general AI.',
    badge: 'Stella now triages emergencies in real time',
    integrations: 'Integrates with <b>ezyVet</b> · <b>RxWorks</b> · <b>Cliniko</b> · <b>Vetport</b>',
    callers: ['Margaret Thompson', 'Sarah Williams', 'Tom Nguyen', 'David Kim'],
    bookings: ['Luna · Annual', 'Buddy · Dental', 'Bella · Vaccination', 'Max · Check-up'],
    smses:    ['Bella confirmed 10am', 'Luna recall scheduled', 'Max vaccination reminder', 'Buddy appointment Thu'],
    sec1H: "Stella picks up every call — day, night, and public holidays.",
    sec1B: "Your existing number forwards to Stella on the rings you choose. She greets pet owners in your clinic's voice, listens, and has a real conversation — no menu trees, no \"press 1 for bookings\".",
    sec2H: "Stella reads your calendar and books directly into open slots.",
    sec2B: "She sees Dr. Patel's Thursday is packed but Dr. Chen has a 4:30 opening. She confirms it with the pet owner on the call, writes it into your schedule, and sends an SMS confirmation before they hang up.",
    sec3H: "Appointments confirmed before they happen. No-shows down to near zero.",
    sec3B: "SMS reminders go out 24 hours and 2 hours before each appointment — with a one-tap YES / RESCHEDULE. Follow-up recalls for vaccinations, annual check-ups, and post-ops keep your chair full without a single reminder phone call.",
    sec4H: "Turn happy pet owners into 5-star Google Reviews — automatically.",
    sec4B: "Every appointment triggers a two-question SMS survey. Promoters (4–5 stars) get a one-tap link that posts straight to your Google Business page — so your best pet owners build your reputation for you.",
    sec4B2: "If someone scores you below a 7, we auto-create a follow-up task and route it to the right vet. You get to the call before they get to Google Reviews — turning a near-miss into a loyal client.",
  },
  dental: {
    headline: 'Every <span class="accent">dental</span> call.<br>Every booking.<br><span class="accent">Zero missed.</span>',
    sub: "Stella answers every call like your best practice manager would — books hygienist and dentist chairs, handles toothache triage, and hands your team a clean clinical note. Trained on thousands of dental calls.",
    mono: 'Purpose-built for dental practices. Not a general AI.',
    badge: 'Stella now triages dental emergencies in real time',
    integrations: 'Integrates with <b>Dental4Windows</b> · <b>Praktika</b> · <b>Oasis</b> · <b>Core Practice</b>',
    callers: ['Jennifer Lawrence', 'Michael Chen', 'Priya Patel', "James O'Brien"],
    bookings: ['Clean & Check · 45m', 'Crown fit · Dr. Singh', 'Hygienist · 30m', 'Wisdom consult · 20m'],
    smses:    ['Jennifer confirmed 2pm', 'Michael recall · 6mo', 'Priya fluoride reminder', 'James crown fitted Thu'],
    sec1H: "Stella picks up every call — day, night, and public holidays.",
    sec1B: "Your existing line forwards to Stella on the rings you choose. She greets patients in your practice's voice, listens, and holds a real conversation — no menu trees, no \"press 1 for hygienist\".",
    sec2H: "Stella reads your chair schedule and books directly into open slots.",
    sec2B: "She sees Dr. Singh's Thursday hygienist chair is packed but Dr. Murphy has a 4:30 opening. She confirms it with the patient on the call, writes it into your schedule, and sends an SMS confirmation before they hang up.",
    sec3H: "Chairs confirmed before they happen. No-shows down to near zero.",
    sec3B: "SMS reminders go out 24 hours and 2 hours before each appointment — with a one-tap YES / RESCHEDULE. Automated 6-month recalls for hygienist visits and check-ups keep every chair full without a single reminder phone call.",
    sec4H: "Turn happy patients into 5-star Google Reviews — automatically.",
    sec4B: "Every appointment triggers a two-question SMS survey. Promoters (4–5 stars) get a one-tap link that posts straight to your Google Business page — so your best patients build your reputation for you.",
    sec4B2: "If someone scores you below a 7, we auto-create a follow-up task and route it to the right dentist. You get to the call before they get to Google Reviews — turning a near-miss into a loyal patient.",
  },
  gp: {
    headline: 'Every <span class="accent">patient</span> call.<br>Every booking.<br><span class="accent">Zero missed.</span>',
    sub: "Stella answers every call like your best reception team would — books into your clinical software, triages symptoms, and hands your GPs a structured clinical handover. Trained on thousands of GP clinic calls.",
    mono: 'Purpose-built for general practice. Not a general AI.',
    badge: 'Stella now triages urgent symptoms in real time',
    integrations: 'Integrates with <b>Best Practice</b> · <b>Medical Director</b> · <b>Zedmed</b> · <b>Cliniko</b>',
    callers: ['Helen Garner', 'Ahmad Khalil', 'Beatrix Potter', 'Daniel Chen'],
    bookings: ['Standard · 15m', 'Long consult · 30m', 'Telehealth · 20m', 'Skin check · 15m'],
    smses:    ['Helen confirmed 9:30', 'Ahmad script ready', 'Beatrix skin check Thu', 'Daniel pathology results'],
    sec1H: "Stella picks up every call — day, night, and public holidays.",
    sec1B: "Your existing number forwards to Stella on the rings you choose. She greets patients in your clinic's voice, listens, and has a real conversation — no menu trees, no \"press 1 for appointments\".",
    sec2H: "Stella reads your clinical calendar and books directly into open slots.",
    sec2B: "She sees Dr. Patel's Thursday is packed but Dr. Chen has a 4:30 opening for a standard consult. She confirms it with the patient on the call, writes it into your schedule, and sends an SMS confirmation before they hang up.",
    sec3H: "Appointments confirmed before they happen. No-shows down to near zero.",
    sec3B: "SMS reminders go out 24 hours and 2 hours before each appointment — with a one-tap YES / RESCHEDULE. Automated recalls for care plans, immunisations, and health assessments keep your books full without a single reminder phone call.",
    sec4H: "Turn happy patients into 5-star Google Reviews — automatically.",
    sec4B: "Every appointment triggers a two-question SMS survey. Promoters (4–5 stars) get a one-tap link that posts straight to your Google Business page — so your best patients build your reputation for you.",
    sec4B2: "If someone scores you below a 7, we auto-create a follow-up task and route it to the right GP. You get to the call before they get to Google Reviews — turning a near-miss into a loyal patient.",
  },
  chiro: {
    headline: 'Every <span class="accent">patient</span> call.<br>Every booking.<br><span class="accent">Zero missed.</span>',
    sub: "Stella answers every call like your best front-desk CA would — books adjustments and new-patient intakes, handles acute flare-ups, and hands your chiropractors a clean pre-consult note. Trained on thousands of chiro calls.",
    mono: 'Purpose-built for chiropractic clinics. Not a general AI.',
    badge: 'Stella now triages acute flare-ups in real time',
    integrations: 'Integrates with <b>Cliniko</b> · <b>Nookal</b> · <b>Halaxy</b> · <b>Jane</b>',
    callers: ['Rachel Foster', 'James Walsh', 'Amara Obi', 'Liam Murray'],
    bookings: ['Adjustment · 15m', 'New patient · 45m', 'Re-eval · 30m', 'Acute flare-up · 20m'],
    smses:    ['Rachel confirmed 8am', 'James re-eval Mon', 'Amara new patient Thu', 'Liam flare-up seen'],
    sec1H: "Stella picks up every call — day, night, and public holidays.",
    sec1B: "Your existing number forwards to Stella on the rings you choose. She greets patients in your clinic's voice, listens, and has a real conversation — no menu trees, no \"press 1 for bookings\".",
    sec2H: "Stella reads your adjustment calendar and books directly into open slots.",
    sec2B: "She sees Dr. Lee's Thursday is packed but Dr. Novak has a 4:30 opening. She confirms it with the patient on the call, writes it into your schedule, and sends an SMS confirmation before they hang up.",
    sec3H: "Appointments confirmed before they happen. No-shows down to near zero.",
    sec3B: "SMS reminders go out 24 hours and 2 hours before each appointment — with a one-tap YES / RESCHEDULE. Automated care-plan recalls and re-evaluation reminders keep your adjustment schedule full without a single reminder phone call.",
    sec4H: "Turn happy patients into 5-star Google Reviews — automatically.",
    sec4B: "Every appointment triggers a two-question SMS survey. Promoters (4–5 stars) get a one-tap link that posts straight to your Google Business page — so your best patients build your reputation for you.",
    sec4B2: "If someone scores you below a 7, we auto-create a follow-up task and route it to the right chiropractor. You get to the call before they get to Google Reviews — turning a near-miss into a loyal patient.",
  },
}

export const TRUST_PILLS: Record<VerticalKey, [string, string, string]> = {
  all:    ['Trained on 50,000+ clinic calls',              'Live in 48 hours', 'No new phone number'],
  vet:    ['ezyVet · RxWorks · Cliniko · Vetport',         'Live in 48 hours', 'No new phone number'],
  dental: ['Dental4Windows · Praktika · EXACT · Oasis',    'Live in 48 hours', 'No new phone number'],
  gp:     ['Best Practice · Medical Director · Genie · Zedmed', 'Live in 48 hours', 'No new phone number'],
  chiro:  ['ChiroTouch · Power Diary · Cliniko · Jane App', 'Live in 48 hours', 'No new phone number'],
}

export const NPS_COMMENTS = [
  'Felt heard', 'Quick response', 'Sarah was so helpful',
  'Dr. Chen was amazing', 'Easy booking',
]

// Industry switcher tabs in display order.
export const VERTICAL_TABS: Array<{ key: VerticalKey; label: string }> = [
  { key: 'all',    label: 'All Clinics' },
  { key: 'vet',    label: 'Veterinary' },
  { key: 'dental', label: 'Dental' },
  { key: 'gp',     label: 'General Practice' },
  { key: 'chiro',  label: 'Chiropractic' },
]

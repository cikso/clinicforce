export type TriageLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'CLINIC_INFO'

const EMERGENCY_KEYWORDS = [
  'can\'t breathe', 'not breathing', 'difficulty breathing', 'collapsed', 'collapse',
  'unconscious', 'seizure', 'fitting', 'convuls', 'pale gums', 'blue gums', 'white gums',
  'grey gums', 'uncontrolled bleeding', 'hit by car', 'run over', 'snake bite', 'snake',
  'toad', 'chocolate', 'xylitol', 'grapes', 'raisins', 'rat poison', 'poisoning', 'toxic',
  'can\'t urinate', 'blocked bladder', 'not urinating', 'male cat', 'straining to wee',
  'bloated stomach', 'distended', 'suspected gvd', 'stomach twisted', 'trauma',
  'not moving', 'limp body', 'loss of vision', 'eye injury', 'eye popped',
]

const URGENT_KEYWORDS = [
  'vomiting', 'vomit', 'throwing up', 'diarrhoea', 'diarrhea', 'not eating', 'won\'t eat',
  'limping', 'lame', 'not walking', 'swollen', 'swelling', 'lethargic', 'tired',
  'scratching', 'itching', 'ear', 'wound', 'cut', 'bleeding a little', 'straining',
  'drinking a lot', 'drinking more', 'peeing a lot', 'weight loss', 'coughing',
  'sneezing', 'discharge', 'red eye', 'cloudy eye',
]

const CLINIC_INFO_KEYWORDS = [
  'hours', 'open', 'close', 'appointment', 'book', 'booking', 'price', 'cost', 'how much',
  'do you treat', 'do you see', 'services', 'where are you', 'address', 'location',
  'phone', 'contact', 'payment', 'insurance', 'afterpay', 'walk in', 'walk-in',
  'parking', 'species', 'rabbits', 'birds', 'exotics',
]

export function classifyTriage(message: string): TriageLevel {
  const lower = message.toLowerCase()

  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))
  if (isEmergency) return 'EMERGENCY'

  const isClinicInfo = CLINIC_INFO_KEYWORDS.some((kw) => lower.includes(kw))
  if (isClinicInfo) return 'CLINIC_INFO'

  const isUrgent = URGENT_KEYWORDS.some((kw) => lower.includes(kw))
  if (isUrgent) return 'URGENT'

  return 'ROUTINE'
}

import fs from 'fs'
import path from 'path'

export interface ClinicConfig {
  clinic_id: string
  clinic_name: string
  address: string
  suburb: string
  state: string
  postcode: string
  phone: string
  email: string
  website: string
  timezone: string
  hours: Record<string, string>
  after_hours: {
    partner_name: string
    phone: string
    address: string
    note: string
  }
  supported_species: string[]
  services: string[]
  service_flags: Record<string, boolean>
  booking_rules: Record<string, string>
  payment_options: string[]
  intake_fields: string[]
}

export function getClinicConfig(clinicId: string): ClinicConfig {
  const filePath = path.join(process.cwd(), 'data', 'clinics', `${clinicId}.json`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as ClinicConfig
}

export function formatClinicContext(config: ClinicConfig): string {
  const hours = Object.entries(config.hours)
    .map(([day, time]) => `  ${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`)
    .join('\n')

  return `
Clinic Name: ${config.clinic_name}
Address: ${config.address}, ${config.suburb} ${config.state} ${config.postcode}
Phone: ${config.phone}
Email: ${config.email}

Opening Hours:
${hours}

After-Hours Emergency:
  ${config.after_hours.partner_name}
  Phone: ${config.after_hours.phone}
  Address: ${config.after_hours.address}
  Note: ${config.after_hours.note}

Species Treated: ${config.supported_species.join(', ')}

Services: ${config.services.join(', ')}

Walk-ins accepted: ${config.service_flags.walk_ins_accepted ? 'Yes' : 'No'}
Online booking: ${config.service_flags.online_booking ? 'Yes' : 'No'}
Payment options: ${config.payment_options.join(', ')}
`.trim()
}

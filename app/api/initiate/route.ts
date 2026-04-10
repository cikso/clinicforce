import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json({
    dynamic_variables: {
      clinic_name: "Baulkham Hills Veterinary Hospital",
      clinic_id: "clinic001",
      clinic_phone: "02 9639 6399",
      clinic_address: "332 Windsor Rd, Baulkham Hills NSW 2153",
      clinic_hours: "Monday to Friday 8am to 7pm, Saturday 9am to 5pm, Sunday 9am to 5pm",
      clinic_services: "wellness consultations, vaccinations, microchipping, desexing, dental care, surgery",
      emergency_partner_name: "Animal Referral Hospital",
      emergency_partner_address: "19 Old Northern Road, Baulkham Hills",
      emergency_partner_phone: "02 9639 7744",
    }
  })
}

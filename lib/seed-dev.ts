import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function seedDev() {
  console.log("🌱 Seeding DEV database...")

  // 1️⃣ Organization
  const orgId = randomUUID()

  await supabase.from("organizations").insert({
    id: orgId,
    name: "Vibra Alto Test Org"
  })

  // 2️⃣ Admin Profile
  const adminId = randomUUID()

  await supabase.from("profiles").insert({
    id: adminId,
    full_name: "Cecile Admin",
    email: "admin@vibra.test",
    role: "cecile_admin"
  })

  await supabase.from("organization_members").insert({
    organization_id: orgId,
    profile_id: adminId,
    org_role: "admin"
  })

  // 3️⃣ Practitioner
  const practitionerId = randomUUID()

  await supabase.from("practitioners").insert({
    id: practitionerId,
    profile_id: adminId,
  })

  // 4️⃣ Service
  const serviceId = randomUUID()

  await supabase.from("services").insert({
    id: serviceId,
    name: "Massage entreprise",
    duration_minutes: 60
  })

  // 5️⃣ Employee
  const employeeId = randomUUID()

  await supabase.from("employees").insert({
    id: employeeId,
    organization_id: orgId,
    profile_id: adminId,
    full_name: "Test Employee",
    email: "employee@test.com"
  })

  // 6️⃣ Appointment
  const appointmentId = randomUUID()

  await supabase.from("appointments").insert({
    id: appointmentId,
    organization_id: orgId,
    employee_id: employeeId,
    practitioner_id: practitionerId,
    service_id: serviceId,
    starts_at: new Date(),
    ends_at: new Date(Date.now() + 60 * 60 * 1000),
    status: "completed"
  })

  // 7️⃣ Billable item
  await supabase.from("billable_items").insert({
    organization_id: orgId,
    appointment_id: appointmentId,
    service_id: serviceId,
    amount: 120,
    practitioner_amount: 80,
    vibra_commission: 40,
    status: "pending"
  })

  console.log("✅ DEV seed complete")
}

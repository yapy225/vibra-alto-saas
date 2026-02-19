import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { organizationId, employeeId, practitionerId, serviceId, startsAt, endsAt } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from("appointments").insert([
      {
        organization_id: organizationId,
        employee_id: employeeId,
        practitioner_id: practitionerId,
        service_id: serviceId,
        starts_at: startsAt,
        ends_at: endsAt,
        status: "requested"
      }
    ])

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
}

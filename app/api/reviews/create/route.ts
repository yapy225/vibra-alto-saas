import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { appointmentId, rating, comment } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // récupérer appointment
    const { data: appointment } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single()

    if (!appointment || appointment.status !== "done") {
      return new Response(JSON.stringify({ error: "RDV non terminé" }), { status: 400 })
    }

    const { error } = await supabase
      .from("reviews")
      .insert([
        {
          appointment_id: appointment.id,
          employee_id: appointment.employee_id,
          practitioner_id: appointment.practitioner_id,
          rating,
          comment
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

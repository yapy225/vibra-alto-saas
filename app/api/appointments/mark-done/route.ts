import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {

    const { appointmentId } = await req.json()

    if (!appointmentId) {
      return new Response(
        JSON.stringify({ error: "appointmentId requis" }),
        { status: 400 }
      )
    }

    // ⚠️ SERVICE ROLE KEY (backend uniquement)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1️⃣ récupérer le RDV
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return new Response(
        JSON.stringify({ error: "RDV introuvable" }),
        { status: 404 }
      )
    }

    // 2️⃣ sécurité : déjà terminé ?
    if (appointment.status === "done") {
      return new Response(
        JSON.stringify({ error: "RDV déjà terminé" }),
        { status: 400 }
      )
    }

    // 3️⃣ récupérer le service
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("price_client, price_practitioner")
      .eq("id", appointment.service_id)
      .single()

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ error: "Service introuvable" }),
        { status: 400 }
      )
    }

    const clientAmount = Number(service.price_client)
    const practitionerAmount = Number(service.price_practitioner)
    const commission = clientAmount - practitionerAmount

    // 4️⃣ passer RDV en done
    await supabase
      .from("appointments")
      .update({ status: "done" })
      .eq("id", appointmentId)

    // 5️⃣ vérifier doublon facturation
    const { data: existingBillable } = await supabase
      .from("billable_items")
      .select("id")
      .eq("appointment_id", appointmentId)
      .maybeSingle()

    if (!existingBillable) {

      await supabase
        .from("billable_items")
        .insert({
          organization_id: appointment.organization_id,
          appointment_id: appointment.id,
          service_id: appointment.service_id,
          amount: clientAmount,
          practitioner_amount: practitionerAmount,
          vibra_commission: commission,
          status: "pending"
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        clientAmount,
        practitionerAmount,
        commission
      }),
      { status: 200 }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500 }
    )
  }
}

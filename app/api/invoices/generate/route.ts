import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1️⃣ récupérer toutes les lignes pending
    const { data: items, error } = await supabase
      .from("billable_items")
      .select("*")
      .eq("status", "pending")

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ message: "Aucune ligne à facturer" }), { status: 200 })
    }

    // 2️⃣ grouper par organization
    const grouped: Record<string, any[]> = {}

    items.forEach(item => {
      if (!grouped[item.organization_id]) {
        grouped[item.organization_id] = []
      }
      grouped[item.organization_id].push(item)
    })

    const invoicesCreated = []

    // 3️⃣ créer une facture par entreprise
    for (const organizationId in grouped) {

      const orgItems = grouped[organizationId]

      const total = orgItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      )

      // créer facture
      const { data: invoice } = await supabase
        .from("invoices")
        .insert({
          organization_id: organizationId,
          period_start: new Date(),
          period_end: new Date(),
          total_amount: total,
          status: "draft"
        })
        .select()
        .single()

      if (invoice) {

        // marquer items comme invoiced
        await supabase
          .from("billable_items")
          .update({ status: "invoiced" })
          .in("id", orgItems.map(i => i.id))

        invoicesCreated.push(invoice)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoicesCreated
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

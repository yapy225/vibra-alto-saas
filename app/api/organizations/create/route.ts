import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const { name, drhEmail } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1️⃣ Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert([{ name }])
      .select()
      .single()

    if (orgError) {
      return new Response(JSON.stringify({ error: orgError.message }), { status: 400 })
    }

    // 2️⃣ Create invitation
    const token = randomUUID()

    const { error: inviteError } = await supabase
      .from("organization_invites")
      .insert([
        {
          organization_id: organization.id,
          email: drhEmail,
          org_role: "org_admin",
          token,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
        }
      ])

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), { status: 400 })
    }

    return new Response(
      JSON.stringify({
        success: true,
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error("SERVER ERROR:", err)
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
}

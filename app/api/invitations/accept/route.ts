import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { token, userId } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1️⃣ get invite
    const { data: invite, error } = await supabase
      .from("organization_invites")
      .select("*")
      .eq("token", token)
      .single()

    if (error || !invite) {
      return new Response(JSON.stringify({ error: "Invalid invite" }), { status: 400 })
    }

    if (new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Invite expired" }), { status: 400 })
    }

    // 2️⃣ create membership
    await supabase.from("organization_members").insert({
      organization_id: invite.organization_id,
      profile_id: userId,
      org_role: invite.org_role
    })

    // 3️⃣ mark invite accepted
    await supabase
      .from("organization_invites")
      .update({ accepted_at: new Date() })
      .eq("id", invite.id)

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
}

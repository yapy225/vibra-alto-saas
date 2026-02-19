import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { reviewId, reply } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from("reviews")
      .update({
        practitioner_reply: reply,
        replied_at: new Date()
      })
      .eq("id", reviewId)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
}

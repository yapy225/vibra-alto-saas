import { seedDev } from "@/lib/seed-dev"
import { NextResponse } from "next/server"

export async function POST() {
  await seedDev()
  return NextResponse.json({ success: true })
}

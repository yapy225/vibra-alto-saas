"use client"

import { useState } from "react"

export default function ContactForm() {
  const [email, setEmail] = useState("")

  return (
    <div style={{ padding: 40 }}>
      <h2>Contact</h2>
      <input
        type="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button style={{ marginLeft: 10 }}>
        Envoyer
      </button>
    </div>
  )
}

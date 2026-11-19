import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleAuth } from "npm:google-auth-library@9.4.1"

const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } })
  }

  try {
    const { token, title, body } = await req.json()
    if (!token || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    })

    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    const projectId = serviceAccount.project_id
    const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: token,
          notification: { title, body },
          android: { notification: { sound: "default" } }
        }
      })
    })

    const fcmData = await fcmRes.json()
    if (!fcmRes.ok) {
      throw new Error(JSON.stringify(fcmData))
    }

    return new Response(JSON.stringify({ success: true, fcmData }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  }
})

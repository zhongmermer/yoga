import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("PROJECT_URL") || "";
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing env config" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: teacherRow } = await admin
    .from("teachers")
    .select("id,is_admin")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!teacherRow?.is_admin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body?.name || "").trim();
  const phone = (body?.phone || "").trim();
  const password = (body?.password || "").trim();
  const requestId = body?.requestId || null;
  if (!name || !phone || !password) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: existingStudent } = await admin
    .from("students")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (existingStudent) {
    return new Response(JSON.stringify({ error: "Phone exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const email = `${phone}@studio.local`;
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError || !authUser?.user) {
    return new Response(JSON.stringify({ error: "Auth create failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: studentRow, error: studentError } = await admin
    .from("students")
    .insert({
      name,
      phone,
      password: "",
      user_id: authUser.user.id,
    })
    .select("*")
    .single();
  if (studentError) {
    return new Response(JSON.stringify({ error: "Student insert failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (requestId) {
    await admin
      .from("registration_requests")
      .update({ status: "approved" })
      .eq("id", requestId);
  }

  return new Response(JSON.stringify({ student: studentRow }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

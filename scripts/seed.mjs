import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { loadEnv } from "./_env.mjs";

const env = { ...loadEnv(), ...process.env };

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = env.DIRECT_URL || env.DATABASE_URL;

const admin = {
  email: env.ADMIN_EMAIL || "admin@thenavigators.com",
  password: env.ADMIN_PASSWORD || "admin@123",
  name: env.ADMIN_NAME || "Admin",
};

if (!supabaseUrl || !serviceKey || !dbUrl) {
  console.error("Missing SUPABASE URL, SUPABASE_SERVICE_ROLE_KEY or DIRECT_URL in .env");
  process.exit(1);
}

/** Create the admin in Supabase Auth, or reset its password if it already exists. */
async function seedAuthUser() {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: admin.email,
    password: admin.password,
    email_confirm: true,
    user_metadata: { name: admin.name, role: "admin" },
  });

  if (!error) {
    console.log(`Auth: created ${admin.email}`);
    return data.user.id;
  }

  if (error.code !== "email_exists" && !/already (registered|exists)/i.test(error.message)) {
    throw error;
  }

  for (let page = 1; ; page++) {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (listError) throw listError;
    const user = list.users.find((u) => u.email?.toLowerCase() === admin.email.toLowerCase());
    if (user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: admin.password,
        email_confirm: true,
      });
      if (updateError) throw updateError;
      console.log(`Auth: ${admin.email} already existed, password updated`);
      return user.id;
    }
    if (list.users.length < 1000) throw new Error(`Auth user ${admin.email} exists but was not found`);
  }
}

/** Upsert the admin row into public.admins with a bcrypt-hashed password. */
async function seedAdminsTable() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions");
    await client.query(
      `INSERT INTO public.admins (email, password, name, role)
       VALUES ($1, extensions.crypt($2, extensions.gen_salt('bf')), $3, 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role`,
      [admin.email, admin.password, admin.name],
    );
    console.log(`Table public.admins: upserted ${admin.email}`);
  } finally {
    await client.end();
  }
}

try {
  await seedAuthUser();
  await seedAdminsTable();
  console.log(`\nLogin with:\n  Email:    ${admin.email}\n  Password: ${admin.password}`);
} catch (err) {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
}

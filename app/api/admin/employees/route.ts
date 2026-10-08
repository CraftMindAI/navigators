import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone, role } = await req.json();

    if (!['admin', 'employee'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      // Encrypt the password before storing in profiles (as requested)
      const encryptedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // 2. Insert into profiles (or update if trigger created it)
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert([
        {
          id: authData.user.id,
          full_name: fullName,
          phone: phone,
          role: role,
          password_hash: encryptedPassword
        }
      ]);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }

      // Also try RPC just in case it's used elsewhere
      await supabaseAdmin.rpc('save_profile_password', {
        p_user_id: authData.user.id,
        p_plain_password: password
      });

      return NextResponse.json({ success: true, user: authData.user });
    }

    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'employee']);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ employees: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

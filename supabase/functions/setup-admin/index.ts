import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nombre, correo, password } = await req.json();

    console.log('Setup admin request received for:', correo);

    // Validaciones básicas
    if (!nombre || !correo || !password) {
      throw new Error('Todos los campos son requeridos');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Crear cliente con service_role_key para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar que NO exista ningún administrador en el sistema
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing admins:', checkError);
      throw new Error('Error al verificar administradores existentes');
    }

    if (existingAdmins && existingAdmins.length > 0) {
      throw new Error('Ya existe un administrador en el sistema. Use la página de login.');
    }

    console.log('No existing admins found, proceeding with creation');

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password: password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nombre: nombre
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    console.log('Auth user created:', authData.user.id);

    // Insertar en tabla usuarios
    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre: nombre,
        correo: correo,
        password_hash: 'managed_by_auth',
        tipo_usuario: 'admin',
        saldo: 0,
      });

    if (usuarioError) {
      console.error('Usuario insert error:', usuarioError);
      // Intentar limpiar el usuario de auth si falla
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw usuarioError;
    }

    console.log('Usuario record created');

    // Asignar rol de admin
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin',
      });

    if (roleError) {
      console.error('Role insert error:', roleError);
      // Intentar limpiar si falla
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw roleError;
    }

    console.log('Admin role assigned successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Administrador creado exitosamente',
        userId: authData.user.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in setup-admin function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error desconocido al crear administrador' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

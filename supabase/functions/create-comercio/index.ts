import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nombre, codigo_comercio, comision, correo, password } = await req.json();

    console.log('Create comercio request received for:', nombre);

    // Validaciones
    if (!nombre || !codigo_comercio || !correo || !password) {
      throw new Error('Todos los campos son requeridos');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (codigo_comercio.length !== 5) {
      throw new Error('El código debe tener exactamente 5 dígitos');
    }

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

    // Verificar si el código ya existe
    const { data: existingCodigo } = await supabaseAdmin
      .from('comercios')
      .select('id')
      .eq('codigo_comercio', codigo_comercio)
      .maybeSingle();

    if (existingCodigo) {
      throw new Error('Ya existe un comercio con este código');
    }

    // Verificar si el email ya existe en auth.users
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers.users?.find(u => u.email === correo);

    if (existingAuthUser) {
      console.log('User exists in auth.users, checking usuarios table:', existingAuthUser.id);
      
      const { data: existingUsuario } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('id', existingAuthUser.id)
        .maybeSingle();

      if (existingUsuario) {
        throw new Error('Ya existe un usuario con este correo electrónico');
      }

      // Usuario corrupto, limpiarlo
      console.log('Cleaning up corrupted user:', existingAuthUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
    }

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password: password,
      email_confirm: true,
      user_metadata: {
        nombre: nombre
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    const userId = authData.user.id;
    console.log('Auth user created:', userId);

    // Insertar en tabla usuarios
    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: userId,
        nombre: nombre,
        correo: correo,
        password_hash: 'managed_by_auth',
        tipo_usuario: 'comercio',
        saldo: 0,
      });

    if (usuarioError) {
      console.error('Usuario insert error:', usuarioError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw usuarioError;
    }

    // Asignar rol de comercio
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'comercio',
      });

    if (roleError) {
      console.error('Role insert error:', roleError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw roleError;
    }

    // Crear comercio
    const { error: comercioError } = await supabaseAdmin
      .from('comercios')
      .insert({
        usuario_id: userId,
        nombre: nombre,
        codigo_comercio: codigo_comercio,
        comision: comision || 5,
        saldo: 0,
      });

    if (comercioError) {
      console.error('Comercio insert error:', comercioError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw comercioError;
    }

    console.log('Comercio created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Comercio creado exitosamente',
        userId: userId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in create-comercio function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error desconocido al crear comercio' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
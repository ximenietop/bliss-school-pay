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
    console.log('Reset admin request received');

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

    // 1. Eliminar todos los registros de user_roles con rol admin
    const { error: roleDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('role', 'admin');

    if (roleDeleteError) {
      console.error('Error deleting admin roles:', roleDeleteError);
      throw new Error('Error al eliminar roles de admin');
    }

    console.log('Admin roles deleted');

    // 2. Eliminar todos los usuarios de tipo admin de la tabla usuarios
    const { data: adminUsers, error: fetchError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('tipo_usuario', 'admin');

    if (fetchError) {
      console.error('Error fetching admin users:', fetchError);
      throw new Error('Error al buscar usuarios admin');
    }

    console.log('Found admin users to delete:', adminUsers?.length || 0);

    if (adminUsers && adminUsers.length > 0) {
      const { error: usuarioDeleteError } = await supabaseAdmin
        .from('usuarios')
        .delete()
        .eq('tipo_usuario', 'admin');

      if (usuarioDeleteError) {
        console.error('Error deleting admin usuarios:', usuarioDeleteError);
        throw new Error('Error al eliminar usuarios admin');
      }

      console.log('Admin usuarios deleted');

      // 3. Eliminar usuarios de auth.users
      for (const adminUser of adminUsers) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(adminUser.id);
          console.log('Deleted auth user:', adminUser.id);
        } catch (error) {
          console.error('Error deleting auth user:', adminUser.id, error);
          // Continuar con los demás aunque falle uno
        }
      }
    }

    console.log('Admin reset completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sistema de admin reseteado exitosamente. Ahora puedes crear un nuevo administrador.',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in reset-admin function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error desconocido al resetear admin' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
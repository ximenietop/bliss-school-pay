-- 1. Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente', 'comercio');

-- 2. Crear tabla user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Crear función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Actualizar políticas de usuarios para usar has_role
DROP POLICY IF EXISTS "usuarios_delete_admin" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_admin" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;

CREATE POLICY "usuarios_select_own"
ON public.usuarios
FOR SELECT
USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "usuarios_update_own"
ON public.usuarios
FOR UPDATE
USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "usuarios_insert_admin"
ON public.usuarios
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "usuarios_delete_admin"
ON public.usuarios
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Actualizar políticas de comercios
DROP POLICY IF EXISTS "comercios_delete_admin" ON public.comercios;
DROP POLICY IF EXISTS "comercios_insert_admin" ON public.comercios;
DROP POLICY IF EXISTS "comercios_select" ON public.comercios;
DROP POLICY IF EXISTS "comercios_update_admin" ON public.comercios;

CREATE POLICY "comercios_select"
ON public.comercios
FOR SELECT
USING (usuario_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "comercios_insert_admin"
ON public.comercios
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "comercios_update_admin"
ON public.comercios
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "comercios_delete_admin"
ON public.comercios
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Actualizar políticas de transacciones
DROP POLICY IF EXISTS "transacciones_insert_admin" ON public.transacciones;
DROP POLICY IF EXISTS "transacciones_insert_cliente" ON public.transacciones;
DROP POLICY IF EXISTS "transacciones_select" ON public.transacciones;

CREATE POLICY "transacciones_select"
ON public.transacciones
FOR SELECT
USING (
  id_usuario = auth.uid() 
  OR id_comercio IN (SELECT id FROM comercios WHERE usuario_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "transacciones_insert_admin"
ON public.transacciones
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "transacciones_insert_cliente"
ON public.transacciones
FOR INSERT
WITH CHECK (
  id_usuario = auth.uid() 
  AND public.has_role(auth.uid(), 'cliente')
  AND tipo = 'compra'
);

-- 9. Actualizar políticas de configuracion
DROP POLICY IF EXISTS "configuracion_update_admin" ON public.configuracion;

CREATE POLICY "configuracion_update_admin"
ON public.configuracion
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
-- Allow admins to INSERT into configuracion
DROP POLICY IF EXISTS configuracion_insert_admin ON public.configuracion;

CREATE POLICY configuracion_insert_admin
ON public.configuracion
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Permitir que clientes vean la lista de comercios
DROP POLICY IF EXISTS "comercios_select" ON public.comercios;

CREATE POLICY "comercios_select_all_authenticated"
ON public.comercios
FOR SELECT
USING (auth.uid() IS NOT NULL);
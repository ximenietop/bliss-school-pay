-- Actualizar función procesar_compra para usar porcentaje de comisión desde configuracion
CREATE OR REPLACE FUNCTION public.procesar_compra(
  p_id_usuario UUID,
  p_id_comercio UUID,
  p_monto NUMERIC,
  p_descripcion TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo_usuario NUMERIC;
  v_saldo_comercio NUMERIC;
  v_comision NUMERIC;
  v_monto_comision NUMERIC;
  v_monto_comercio NUMERIC;
  v_transaccion_id UUID;
BEGIN
  -- Verificar saldo del usuario
  SELECT saldo INTO v_saldo_usuario
  FROM usuarios
  WHERE id = p_id_usuario;

  IF v_saldo_usuario < p_monto THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente');
  END IF;

  -- Obtener saldo del comercio
  SELECT saldo INTO v_saldo_comercio
  FROM comercios
  WHERE id = p_id_comercio;

  -- Obtener porcentaje de comisión desde configuracion
  SELECT CAST(valor AS NUMERIC) INTO v_comision
  FROM configuracion
  WHERE parametro = 'porcentaje_comision';

  -- Si no existe el parámetro, usar 5% por defecto
  IF v_comision IS NULL THEN
    v_comision := 5;
  END IF;

  -- Calcular montos
  v_monto_comision := (p_monto * v_comision) / 100;
  v_monto_comercio := p_monto - v_monto_comision;

  -- Crear transacción
  INSERT INTO transacciones (tipo, descripcion, id_usuario, id_comercio, monto)
  VALUES ('compra', p_descripcion, p_id_usuario, p_id_comercio, p_monto)
  RETURNING id INTO v_transaccion_id;

  -- Actualizar saldo del usuario
  UPDATE usuarios
  SET saldo = saldo - p_monto
  WHERE id = p_id_usuario;

  -- Actualizar saldo del comercio
  UPDATE comercios
  SET saldo = saldo + v_monto_comercio
  WHERE id = p_id_comercio;

  RETURN jsonb_build_object(
    'success', true,
    'transaccion_id', v_transaccion_id,
    'comision', v_monto_comision,
    'monto_comercio', v_monto_comercio
  );
END;
$$;
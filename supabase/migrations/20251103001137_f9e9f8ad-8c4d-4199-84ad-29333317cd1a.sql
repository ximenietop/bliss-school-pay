-- Crear tabla de usuarios (clientes, comercios y admins)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('cliente', 'comercio', 'admin')),
  saldo DECIMAL(10, 2) DEFAULT 0 CHECK (saldo >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de comercios
CREATE TABLE public.comercios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  codigo_comercio TEXT UNIQUE NOT NULL CHECK (length(codigo_comercio) = 5),
  comision DECIMAL(5, 2) DEFAULT 5.00 CHECK (comision >= 0 AND comision <= 100),
  saldo DECIMAL(10, 2) DEFAULT 0 CHECK (saldo >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de transacciones
CREATE TABLE public.transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  id_comercio UUID REFERENCES public.comercios(id) ON DELETE SET NULL,
  monto DECIMAL(10, 2) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('recarga', 'compra', 'pago', 'comision')),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de configuración
CREATE TABLE public.configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parametro TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insertar configuración por defecto (comisión 5%)
INSERT INTO public.configuracion (parametro, valor) VALUES ('comision_general', '5.00');

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
-- Los usuarios pueden ver su propia información
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT USING (id = auth.uid() OR (SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Solo admins pueden insertar usuarios
CREATE POLICY "usuarios_insert_admin" ON public.usuarios
  FOR INSERT WITH CHECK ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Los usuarios pueden actualizar su propia información
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (id = auth.uid() OR (SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Solo admins pueden eliminar usuarios
CREATE POLICY "usuarios_delete_admin" ON public.usuarios
  FOR DELETE USING ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Políticas RLS para comercios
-- Los comercios pueden ver su propia información, los admins pueden ver todos
CREATE POLICY "comercios_select" ON public.comercios
  FOR SELECT USING (
    usuario_id = auth.uid() OR 
    (SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Solo admins pueden crear comercios
CREATE POLICY "comercios_insert_admin" ON public.comercios
  FOR INSERT WITH CHECK ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Solo admins pueden actualizar comercios
CREATE POLICY "comercios_update_admin" ON public.comercios
  FOR UPDATE USING ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Solo admins pueden eliminar comercios
CREATE POLICY "comercios_delete_admin" ON public.comercios
  FOR DELETE USING ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Políticas RLS para transacciones
-- Los usuarios pueden ver sus propias transacciones
CREATE POLICY "transacciones_select" ON public.transacciones
  FOR SELECT USING (
    id_usuario = auth.uid() OR 
    id_comercio IN (SELECT id FROM public.comercios WHERE usuario_id = auth.uid()) OR
    (SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Los clientes pueden insertar transacciones de compra
CREATE POLICY "transacciones_insert_cliente" ON public.transacciones
  FOR INSERT WITH CHECK (
    id_usuario = auth.uid() AND
    (SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'cliente' AND
    tipo = 'compra'
  );

-- Los admins pueden insertar cualquier tipo de transacción
CREATE POLICY "transacciones_insert_admin" ON public.transacciones
  FOR INSERT WITH CHECK ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Políticas RLS para configuración
-- Todos los usuarios autenticados pueden leer la configuración
CREATE POLICY "configuracion_select_all" ON public.configuracion
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo admins pueden modificar la configuración
CREATE POLICY "configuracion_update_admin" ON public.configuracion
  FOR UPDATE USING ((SELECT tipo_usuario FROM public.usuarios WHERE id = auth.uid()) = 'admin');

-- Insertar datos de prueba
-- Usuarios de prueba (contraseñas hasheadas con bcrypt - password: "test123")
INSERT INTO public.usuarios (nombre, correo, password_hash, tipo_usuario, saldo) VALUES
  ('Juan Pérez', 'juan.perez@colegiorefous.edu.co', '$2a$10$rKZLQNxvLXQNxvLXQNxvLO7K4mVZYkQNxvLXQNxvLXQNxvLXQNxvL', 'cliente', 50000),
  ('María García', 'maria.garcia@colegiorefous.edu.co', '$2a$10$rKZLQNxvLXQNxvLXQNxvLO7K4mVZYkQNxvLXQNxvLXQNxvLXQNxvL', 'cliente', 30000),
  ('Cafetería Escolar', 'cafeteria@bliss.com', '$2a$10$rKZLQNxvLXQNxvLXQNxvLO7K4mVZYkQNxvLXQNxvLXQNxvLXQNxvL', 'comercio', 0),
  ('Papelería El Lápiz', 'papeleria@bliss.com', '$2a$10$rKZLQNxvLXQNxvLXQNxvLO7K4mVZYkQNxvLXQNxvLXQNxvLXQNxvL', 'comercio', 0),
  ('Admin BLISS', 'admin@bliss.com', '$2a$10$rKZLQNxvLXQNxvLXQNxvLO7K4mVZYkQNxvLXQNxvLXQNxvLXQNxvL', 'admin', 0);

-- Comercios de prueba
INSERT INTO public.comercios (usuario_id, nombre, codigo_comercio, comision, saldo)
SELECT id, nombre, codigo_comercio, comision, saldo FROM (
  SELECT u.id, 'Cafetería Escolar' as nombre, '10001' as codigo_comercio, 5.00 as comision, 0.00 as saldo
  FROM public.usuarios u WHERE u.correo = 'cafeteria@bliss.com'
  UNION ALL
  SELECT u.id, 'Papelería El Lápiz' as nombre, '10002' as codigo_comercio, 5.00 as comision, 0.00 as saldo
  FROM public.usuarios u WHERE u.correo = 'papeleria@bliss.com'
) comercios_data;

-- Transacciones de prueba
INSERT INTO public.transacciones (id_usuario, id_comercio, monto, descripcion, tipo)
SELECT u.id, c.id, 5000, 'Almuerzo escolar', 'compra'
FROM public.usuarios u
CROSS JOIN public.comercios c
WHERE u.correo = 'juan.perez@colegiorefous.edu.co' AND c.codigo_comercio = '10001'
UNION ALL
SELECT u.id, c.id, 3500, 'Cuadernos y lápices', 'compra'
FROM public.usuarios u
CROSS JOIN public.comercios c
WHERE u.correo = 'maria.garcia@colegiorefous.edu.co' AND c.codigo_comercio = '10002';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_correo ON public.usuarios(correo);
CREATE INDEX idx_usuarios_tipo ON public.usuarios(tipo_usuario);
CREATE INDEX idx_comercios_codigo ON public.comercios(codigo_comercio);
CREATE INDEX idx_transacciones_usuario ON public.transacciones(id_usuario);
CREATE INDEX idx_transacciones_comercio ON public.transacciones(id_comercio);
CREATE INDEX idx_transacciones_fecha ON public.transacciones(fecha DESC);
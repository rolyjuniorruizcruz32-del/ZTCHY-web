-- Script SQL para Supabase
-- Ejecuta este código en el SQL Editor de Supabase

-- 1. Crear tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_completo TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad
-- Los usuarios solo pueden ver y editar su propio perfil

-- Política para lectura (SELECT)
CREATE POLICY "Los usuarios pueden ver su propio perfil"
    ON public.perfiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política para inserción (INSERT)
CREATE POLICY "Los usuarios pueden crear su propio perfil"
    ON public.perfiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política para actualización (UPDATE)
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
    ON public.perfiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para eliminación (DELETE)
CREATE POLICY "Los usuarios pueden eliminar su propio perfil"
    ON public.perfiles
    FOR DELETE
    USING (auth.uid() = id);

-- 4. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. (Opcional) Crear función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, email, nombre_completo)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'nombre_completo'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ¡Listo! Tu base de datos está configurada
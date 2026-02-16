
import { createClient } from '@supabase/supabase-js';

// Usamos variables de entorno para no exponer las llaves en GitHub
// Si estás probando localmente y no funcionan, puedes poner las strings directamente aquí temporalmente
// Fix: Use type assertion for import.meta to access env property which may not be present in some TypeScript configurations
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ifihdyucteqqcyztqlxl.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaWhkeXVjdGVxcWN5enRxbHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzkyNzYsImV4cCI6MjA4NjAxNTI3Nn0.8OGv4Ojoh2CDUK6xxnDPC5nGXyYID6l9p_ClyinDCyo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

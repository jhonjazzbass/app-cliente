// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 👇 Vite lee las variables del archivo .env y las pone aquí
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
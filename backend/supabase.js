const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false
            }
        });
        console.log('✅ Supabase client berhasil diinisialisasi:', supabaseUrl);
    } catch (err) {
        console.error('❌ Gagal menginisialisasi Supabase client:', err.message);
    }
} else {
    console.warn('⚠️ SUPABASE_URL atau SUPABASE_KEY belum diset.');
}

module.exports = {
    supabase,
    isSupabaseConfigured: () => !!supabase
};

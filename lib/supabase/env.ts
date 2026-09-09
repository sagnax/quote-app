// ATENÇÃO: acesso precisa ser literal (process.env.NEXT_PUBLIC_X), nunca
// computado (process.env[name]). Bundlers só conseguem embutir as variáveis
// NEXT_PUBLIC_* no código do navegador com chave estática; acesso computado
// resulta em `undefined` no browser mesmo com o .env.local correto.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Variáveis NEXT_PUBLIC_SUPABASE_* não definidas. Veja .env.example.",
  );
}

export const SUPABASE_URL: string = url;
export const SUPABASE_ANON_KEY: string = anonKey;

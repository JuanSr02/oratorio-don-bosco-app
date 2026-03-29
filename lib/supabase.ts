import { createBrowserClient } from '@supabase/ssr'

// Cliente browser (singleton) — para uso en lib/db.ts y componentes cliente
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

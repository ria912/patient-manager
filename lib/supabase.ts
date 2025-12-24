// lib/supabase.ts のコード例 (Next.js推奨のTS記法)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// '!' (非nullアサーション演算子):
// TypeScriptに対して「この変数は絶対に空ではない」と教えるおまじないです。
// Next.jsの環境では、.env.localに設定されていれば必ず存在するため、この記法を使います。

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
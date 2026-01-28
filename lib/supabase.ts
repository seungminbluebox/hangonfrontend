import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

// 빌드 시점에 환경 변수가 없어도 에러가 나지 않도록 초기화합니다.
// 실제 런타임에서는 Vercel에 설정된 환경 변수를 사용하게 됩니다.
export const supabase = createClient(supabaseUrl, supabaseKey);

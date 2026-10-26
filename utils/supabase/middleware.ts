import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://aocznpicrpnafqilfagz.supabase.co";

const supabaseKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_vUqAeZ3rNjSgXUnLbwlEpA_mSk76HNG";

export const createClient = (cookieAdapter?: {
  getCookies: () => { name: string; value: string }[];
  setCookie: (name: string, value: string, options?: any) => void;
}) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieAdapter?.getCookies() || [];
        },
        setAll(cookiesToSet) {
          if (cookieAdapter?.setCookie) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieAdapter.setCookie(name, value, options)
            );
          }
        },
      },
    }
  );
};

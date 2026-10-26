import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://aocznpicrpnafqilfagz.supabase.co";

const supabaseKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_vUqAeZ3rNjSgXUnLbwlEpA_mSk76HNG";

export interface CookieStoreLike {
  getAll: () => { name: string; value: string }[] | Record<string, string>;
  set?: (name: string, value: string, options?: any) => void;
  get?: (name: string) => { name: string; value: string } | string | undefined;
}

export const createClient = (cookieStore?: CookieStoreLike) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          if (!cookieStore) return [];
          const all = cookieStore.getAll();
          if (Array.isArray(all)) return all;
          return Object.entries(all || {}).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          try {
            if (cookieStore?.set) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set!(name, value, options)
              );
            }
          } catch {
            // Ignored in server contexts where cookies are immutable
          }
        },
      },
    }
  );
};

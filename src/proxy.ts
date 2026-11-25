import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Pemeriksaan awal: tanpa sesi, semua halaman dialihkan ke /login.
 * Pemeriksaan peran yang sebenarnya tetap dilakukan di setiap halaman dan Server Action.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn: boolean;

  if (!url || !key) {
    signedIn = request.cookies.has("acc_demo_user");
  } else {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    });
    signedIn = Boolean((await supabase.auth.getUser()).data.user);
  }

  // /setup hanya berguna sebelum ada pengurus; halamannya sendiri menutup diri setelah itu.
  const path = request.nextUrl.pathname;
  const isPublic = path === "/login" || path === "/setup";
  if (!signedIn && !isPublic) return NextResponse.redirect(new URL("/login", request.url));
  if (signedIn && isPublic && !request.nextUrl.searchParams.has("akun")) return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/intake|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};

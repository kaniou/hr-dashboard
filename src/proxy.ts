import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type ProxyRule = {
  path: string;
  roles: string[];
  redirectTo: string;
};

const PROXY_RULES: ProxyRule[] = [
  { path: "/admin", roles: ["ADMIN"], redirectTo: "/dashboard" },
  { path: "/dashboard", roles: [], redirectTo: "/auth/signin" },
];

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (session?.user && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  for (const rule of PROXY_RULES) {
    if (!pathname.startsWith(rule.path)) continue;

    if (!session?.user) {
      const signInUrl = new URL(rule.redirectTo, req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (rule.roles.length > 0 && !rule.roles.includes(session.user.role)) {
      return NextResponse.redirect(new URL(rule.redirectTo, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/signin"],
};

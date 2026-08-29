import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const appId = process.env.KKU_APP_ID;
  const ssoLogoutUrl = new URL("https://sso-uat-web.kku.ac.th/logout");

  if (appId) ssoLogoutUrl.searchParams.set("app", appId);

  const response = NextResponse.redirect(ssoLogoutUrl);
  const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  const isSecure = envUrl
    ? new URL(envUrl).protocol === "https:"
    : request.nextUrl.protocol === "https:";
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

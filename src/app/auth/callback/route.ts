import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "@auth/core/jwt";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(errorParam)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=missing_code", request.url)
    );
  }

  try {
    const tokenResponse = await fetch(process.env.KKU_TOKEN_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        app: process.env.KKU_APP_ID,
        redirectUrl: process.env.KKU_REDIRECT_URL,
        clientId: process.env.KKU_CLIENT_ID,
        clientSecret: process.env.KKU_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("KKU token exchange failed:", tokenResponse.status, errorText.substring(0, 500));
      return NextResponse.redirect(
        new URL("/auth/signin?error=token_exchange_failed", request.url)
      );
    }

    const raw = await tokenResponse.text();
    let tokenData: Record<string, unknown>;

    try {
      tokenData = JSON.parse(raw);
    } catch {
      console.error("KKU token response is not JSON:", raw.substring(0, 500));
      return NextResponse.redirect(
        new URL("/auth/signin?error=invalid_token_response", request.url)
      );
    }

    const accessToken = tokenData.accessToken as string | undefined;
    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=missing_access_token", request.url)
      );
    }

    const email = String(tokenData.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.redirect(
        new URL("/auth/signin?error=missing_email", request.url)
      );
    }

    // Access is granted only to accounts explicitly registered in the User
    // table. Never auto-create users from the SSO session.
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.warn(`Login denied: ${email} is not in the User table`);
      return NextResponse.redirect(
        new URL("/auth/signin?error=access_denied", request.url)
      );
    }

    const jwtPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: null as unknown as string,
      role: user.role,
      faculty: user.faculty,
      division: user.division,
      provider: "kku",
      accessToken,
      expiresAt: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    };

    // @auth/core resolves the protocol from AUTH_URL first (if set), falling
    // back to the incoming request's protocol. Mirror that logic so the
    // cookie name/salt always matches what proxy.ts / auth() will look for.
    const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
    const isSecure = envUrl
      ? new URL(envUrl).protocol === "https:"
      : request.nextUrl.protocol === "https:";
    const cookieName = isSecure
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    const encodedToken = await encode({
      token: jwtPayload,
      secret: process.env.AUTH_SECRET!,
      maxAge: 8 * 60 * 60,
      salt: cookieName,
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    response.cookies.set(cookieName, encodedToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        metadata: { provider: "kku" },
        ipAddress:
          request.headers.get("x-forwarded-for") ?? "unknown",
      },
    });

    return response;
  } catch (error) {
    console.error("SSO callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/signin?error=server_error", request.url)
    );
  }
}

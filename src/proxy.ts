import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

// Rutas protegidas (de tu sidebar)
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/users",
  "/roles",
  "/permissions",
  "/branches",
  "/windows",
  "/services",
  "/assignments",
  "/advertisements",
  "/customer-service",
];

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|woff|woff2)$/)
  );
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No interceptar assets
  if (isAssetPath(pathname)) return NextResponse.next();

  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasValidToken = Boolean(refreshToken);

  // Si está en login y ya tiene token => dashboard
  if (isPublicPath(pathname) && hasValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si es ruta protegida y no tiene token => login con from
  if (isProtectedPath(pathname) && !hasValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // protegidas
    "/dashboard/:path*",
    "/users/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/branches/:path*",
    "/windows/:path*",
    "/services/:path*",
    "/assignments/:path*",
    "/advertisements/:path*",
    "/customer-service/:path*",

    // pública (para redirigir si ya tiene token)
    "/login",
  ],
};
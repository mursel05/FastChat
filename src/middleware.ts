import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const pathname = req.nextUrl.pathname;
  const authRoutes = ["/login", "/signup"];
  const isResetPasswordRoute = pathname.startsWith("/reset_password/");
  if (
    !refreshToken &&
    !authRoutes.includes(pathname) &&
    !isResetPasswordRoute
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (refreshToken && (authRoutes.includes(pathname) || isResetPasswordRoute)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|icons|favicon.png).*)"],
};

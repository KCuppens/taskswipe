import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/triage", req.url))
    }
    return NextResponse.next()
  }

  if (!isAuth && req.nextUrl.pathname !== "/") {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return NextResponse.redirect(
      new URL("/login?from=" + encodeURIComponent(from), req.url)
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

import { hasActivePlan } from "@/lib/user-plan"

export default withAuth(
  async function middleware(req) {
    const session = req.nextauth.token
    if (!session || !session.email) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
    const ok = await hasActivePlan(session.email)
    if (!ok) {
      return NextResponse.redirect(new URL("/planos", req.url))
    }
    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: ["/produtos/:path*", "/pedidos/:path*", "/dashboard/:path*", "/integracao/:path*"],
}

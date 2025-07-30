import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: ["/produtos/:path*", "/pedidos/:path*", "/dashboard/:path*", "/integracao/:path*"],
}

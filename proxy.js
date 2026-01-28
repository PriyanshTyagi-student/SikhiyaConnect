// proxy.js
// Client-side auth is handled via useAuth + ProtectedRoute

import { NextResponse } from 'next/server'

export default function proxy(request) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}
